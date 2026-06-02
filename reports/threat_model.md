# Threat Model — gopdfsuit-qua

*STRIDE analysis for the gopdfsuit-qua PDF generation service and auth-ms microservice*
*Methodology: STRIDE per element*
*Date: 2026-06-01*

---

## 1. System DFD

The following Data Flow Diagram shows all components, data flows, and trust boundaries.
It extends the architecture DFD from `reports/architecture_model.md` with threat annotations.

```
[Browser]
    │
    │ HTTP/HTTPS (Bearer JWT)
    ▼
[auth-ms :9090] ──── SQLite (auth.db volume)
    │ JWT token returned
    │
[Browser] ─── Bearer <JWT> ──► [gopdfsuit backend :8080]
                                        │
                         ┌──────────────┼──────────────────┐
                         ▼              ▼                  ▼
                  [PDF Engine]   [Chromium headless]  [Font registry]
                  (in-process)    (subprocess)         (global state)
                                        │
                                  External URLs / HTML
```

**Data flows:**
- Browser authenticates against auth-ms (:9090) via `/auth/register` or `/auth/login`
- auth-ms issues a signed HS256 JWT and persists user credentials in SQLite (auth.db)
- Browser presents the JWT in an `Authorization: Bearer` header to the backend (:8080)
- Backend optionally validates the JWT (controlled by `AUTH_ENABLED` env var)
- `/htmltopdf` and `/htmltoimage` pass caller-supplied URLs directly to Chromium headless
- Chromium fetches external (or internal) URLs with no network restriction
- Font uploads write into an in-process global font registry (shared state)
- `/debug/pprof` exposes runtime diagnostics, guarded only by IP check

---

## 2. Trust Boundaries

Four trust boundaries divide the system into security zones of different trust levels.

### TB1: Internet ↔ auth-ms

**Scope:** All traffic entering auth-ms from the public Internet (port 9090).

**Why a trust boundary:** auth-ms is an internet-facing service accepting unauthenticated
registration and login requests. All input is externally controlled; credentials and JWTs
cross this boundary.

**Security expectation:** Rate limiting, input validation on email/password fields,
bcrypt hashing before storage, CORS origin restriction for browser clients.

**Gap:** `AUTH_CORS_ORIGIN: "*"` in docker-compose.yml allows any origin to make credentialed
requests to auth-ms endpoints (T-04-05).

---

### TB2: Internet ↔ backend API

**Scope:** All traffic entering the gopdfsuit backend on port 8080 (`/api/v1/*` routes).

**Why a trust boundary:** The backend exposes a rich API including PDF generation, file upload,
and administrative endpoints. Auth enforcement is environment-gated.

**Security expectation:** All `/api/v1` endpoints require a valid JWT Bearer token.
CORS should restrict allowed origins to known frontend domains.

**Gap:** `AUTH_ENABLED` defaults to unset locally, meaning all `/api/v1` endpoints accept
unauthenticated requests (T-04-03). CORS returns wildcard `*` for non-localhost origins (T-04-04).

---

### TB3: Backend ↔ Chromium subprocess

**Scope:** The data path from the backend handler to the headless Chromium process
launched by `gochromedp`.

**Why a trust boundary:** The caller-supplied URL field is passed directly across a
process boundary into a subprocess that has unrestricted network access. The Chromium
process can reach any network endpoint the container host can reach, including internal
services, cloud metadata endpoints (169.254.169.254), and other containers on the
Docker network.

**Security expectation:** URL allowlisting or blocking of RFC-1918 and link-local
address ranges before the URL is passed to Chromium.

**Gap:** `internal/pdf/pdf.go` calls `gochromedp.ConvertURLToPDF(req.URL, ...)` with no
validation — confirmed SSRF vector (T-04-02).

---

### TB4: Backend ↔ auth-ms (shared JWT secret)

**Scope:** The implicit trust relationship between the backend and auth-ms established
via the shared `AUTH_JWT_SECRET` environment variable.

**Why a trust boundary:** Both services independently read `AUTH_JWT_SECRET` at startup
and use it for JWT signing (auth-ms) and verification (backend middleware). If the secret
is weak or default, an attacker who knows the secret can forge tokens without interacting
with auth-ms at all.

**Security expectation:** A strong, randomly generated secret set via environment injection
at deploy time; startup rejection if the default insecure value is detected.

**Gap:** docker-compose.yml sets `AUTH_JWT_SECRET: ${AUTH_JWT_SECRET:-dev-insecure-secret-change-me}`.
The default is a publicly known string (T-04-01).

---

## 3. STRIDE Threat Register

All 9 threats cover the five required attack surfaces: auth-ms, PDF generation, Chromium/SSRF,
font upload, admin endpoints, and OCR adapter. The table satisfies EXT-06.

| ID | Component | Threat | STRIDE | Likelihood | Impact | Mitigation |
|----|-----------|--------|--------|------------|--------|------------|
| T-04-01 | auth-ms | Weak default JWT secret `dev-insecure-secret-change-me` in docker-compose.yml allows token forgery | Spoofing | High | High | Require `AUTH_JWT_SECRET` env override; reject insecure default in production |
| T-04-02 | /htmltopdf, /htmltoimage | Caller-supplied `url` field passed directly to `gochromedp.ConvertURLToPDF` — SSRF allows fetching internal/cloud metadata endpoints | Tampering / Info Disclosure | High | High | URL allowlist or block `169.254.*`, `10.*`, `172.16-31.*`, `192.168.*` |
| T-04-03 | Auth middleware | `AUTH_ENABLED` defaults to false locally; `authRequired()` only activates on Cloud Run — unauthenticated access to all /api/v1 endpoints | Elevation of Privilege | High | High | Default-deny; require explicit `AUTH_ENABLED=true` even locally |
| T-04-04 | CORS middleware | `resolveAllowOrigin` returns `"*"` for non-localhost origins; `Access-Control-Allow-Headers: *` — wildcard CORS allows any origin to call the API with user credentials | Info Disclosure | Medium | Medium | Lock `GOPDFSUIT_CORS_ALLOW_ORIGIN` to known origins; remove wildcard headers |
| T-04-05 | auth-ms CORS | `AUTH_CORS_ORIGIN: "*"` in docker-compose.yml — auth-ms also allows wildcard CORS, enabling cross-site credential theft | Info Disclosure | Medium | High | Set explicit origin; default should not be wildcard |
| T-04-06 | /api/v1/fonts (POST) | Font upload validates only `.ttf`/`.otf` extension, registers from `file.Filename` sans sanitization — malformed font can panic PDF engine; filename used as font name without cleaning | Tampering / DoS | Medium | Medium | Validate magic bytes, not just extension; sanitize font name before registry key |
| T-04-07 | PDF zlib decompression | G110 findings: 8 instances of unbounded `io.ReadAll` on zlib streams in PDF parsing — malicious PDF can trigger decompression bomb (DoS) | Denial of Service | Medium | High | Add `io.LimitReader` wrapper before decompression |
| T-04-08 | /debug/pprof | Pprof endpoint guarded by `clientIP` check only — IP spoofing or SSRF from within the container network can expose heap/goroutine dumps | Info Disclosure | Low | Medium | Add auth token for pprof; keep IP check as secondary |
| T-04-09 | OCR adapter | `ocr_adapter.go` passes file paths and potentially tool binary paths to subprocess execution — if caller-influenced, enables OS command injection (G204). Also handles file output paths subject to path traversal (G304) | Tampering / Elevation of Privilege | Medium | High | Validate and whitelist acceptable OCR tool paths; never accept tool binary paths from external input; apply `filepath.Clean` + prefix validation on output paths |

---

## 4. Threat Summary by STRIDE Category

| STRIDE Category | Count | Primary Threats |
|-----------------|-------|-----------------|
| Spoofing | 1 | T-04-01 |
| Tampering | 3 | T-04-02, T-04-06, T-04-09 |
| Repudiation | 0 | — |
| Info Disclosure | 4 | T-04-04, T-04-05, T-04-02 (also), T-04-08 |
| Denial of Service | 2 | T-04-06 (also), T-04-07 |
| Elevation of Privilege | 2 | T-04-03, T-04-09 (also) |

> **Note:** Threats with dual STRIDE classification (T-04-02: Tampering + Info Disclosure;
> T-04-06: Tampering + DoS; T-04-09: Tampering + Elevation of Privilege) appear in both
> applicable categories. Total unique threats = 9; total category-attribution slots = 12.

**Total unique threats:** 9
**Attack surfaces covered:** PDF generation (T-04-07), auth-ms (T-04-01, T-04-05),
Chromium/SSRF (T-04-02), font upload (T-04-06), admin endpoints (T-04-08),
CORS/auth bypass (T-04-03, T-04-04), OCR adapter (T-04-09)

---

## 5. Priority Threats (Top 3 by Risk Score)

Risk score = Likelihood × Impact (High=3, Medium=2, Low=1). When risk scores tie at 9/9,
threats are ranked by precondition count — threats requiring zero preconditions rank above
those requiring a prior exploit step.

### Priority 1 — T-04-02: SSRF via /htmltopdf (Risk: 9/9)

**Why highest priority:** Server-Side Request Forgery via the `url` field in `/htmltopdf` and
`/htmltoimage` is immediately exploitable with a single unauthenticated HTTP request in the
default local configuration (since AUTH_ENABLED is off by default, compounding with T-04-03).
A successful SSRF can:
- Exfiltrate cloud metadata (AWS IMDSv1 at 169.254.169.254, GCP metadata at same address)
- Pivot to internal Docker-network services (auth-ms, any co-located containers)
- Bypass TB3 entirely — Chromium fetches whatever URL the attacker supplies

**Immediate remediation:** Validate and allowlist the `url` field before passing to
`gochromedp.ConvertURLToPDF`; block RFC-1918 and link-local ranges.

---

### Priority 2 — T-04-03: AUTH_ENABLED defaults false (Risk: 9/9)

**Why highest priority:** The auth toggle defaulting to disabled means the entire `/api/v1`
surface is unauthenticated in the standard local deployment. Every other API-level control
(rate limiting, user isolation, audit logging) is rendered irrelevant when the auth gate
is not engaged. Combined with T-04-02, this creates a zero-credential path to SSRF.

**Immediate remediation:** Invert the default — require `AUTH_ENABLED=false` to be explicit;
fail safe to auth-required. Alternatively, remove the env-var toggle entirely and always enforce
JWT verification, using test mocks for integration tests instead.

---

### Priority 3 — T-04-01: Weak default JWT secret (Risk: 9/9)

**Why high priority:** The default secret `dev-insecure-secret-change-me` is a publicly
known string committed to the repository. Any attacker with this string can forge valid
HS256 JWTs for any user ID or email without interacting with auth-ms. When AUTH_ENABLED
is set to true (e.g., on Cloud Run), this becomes a critical authentication bypass.

**Contrast with lower-priority threats:** T-04-04 and T-04-05 (CORS wildcards) require
a victim to visit an attacker-controlled page in a browser session — a social-engineering
step that reduces exploitability. T-04-06 (font upload) requires crafting a malformed
font binary. T-04-07 (decompression bomb) requires uploading a malicious PDF. T-04-08
(pprof) requires first exploiting T-04-02 (SSRF) to reach it. The top three threats
are all directly exploitable with publicly available information or a single HTTP request.

---

## 6. Source Mapping

| Threat | Source Evidence | Gosec ID |
|--------|----------------|----------|
| T-04-01 | docker-compose.yml `AUTH_JWT_SECRET:-dev-insecure-secret-change-me`; auth-ms/main.go:17 | — |
| T-04-02 | internal/pdf/pdf.go:55 `gochromedp.ConvertURLToPDF(req.URL, ...)` — identified by manual code review; gosec G107 did not flag this location | — |
| T-04-03 | internal/middleware/auth.go:18 `var authEnabledCached = os.Getenv("AUTH_ENABLED") == "true"` | — |
| T-04-04 | internal/middleware/cors.go `resolveAllowOrigin` returns `"*"` | — |
| T-04-05 | docker-compose.yml `AUTH_CORS_ORIGIN: "*"` | — |
| T-04-06 | internal/handlers/handlers.go `handleUploadFont` — extension check only, `file.Filename` unescaped | G304 |
| T-04-07 | internal/pdf/* 8 unbounded `io.ReadAll` on zlib readers | G110 |
| T-04-08 | internal/handlers/handlers.go `clientIP` guard on `/debug/pprof` | — |
| T-04-09 | internal/ocr/ocr_adapter.go — file paths and tool binary paths passed to subprocess | G204, G304 |
