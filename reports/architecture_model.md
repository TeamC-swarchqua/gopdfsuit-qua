# Architecture Model — gopdfsuit-qua

*Pre-inspection document: written from README.md, docker-compose.yml, and Dockerfiles only.
Source code was inspected only in Section 4 (Conformance Check), after the expected model
was fully committed to this document.*

**Date written:** 2026-06-01
**Phase:** 04 — Lab Extension
**Requirements satisfied:** EXT-03 (pre-inspection model), EXT-04 (conformance table)

---

## 1. System Components (Expected — from README and docker-compose.yml)

The following components are derived exclusively from README.md, docker-compose.yml,
dockerfolder/Dockerfile, and auth-ms/Dockerfile. No source code was read at this stage.

| Component | Role | Port | Technology | Evidence Source |
|-----------|------|------|------------|-----------------|
| gopdfsuit backend | PDF generation API, React SPA serving | 8080 | Go 1.24 + Gin + chromedp | README requirements; dockerfolder/Dockerfile EXPOSE 8080 |
| auth-ms | User registration, login, JWT issuance and verification | 9090 | Go 1.25 + Gin + SQLite (pure-Go modernc) | docker-compose.yml port 9090; auth-ms/Dockerfile |
| React SPA | Browser UI (viewer, editor, merger, filler, converters) | embedded in :8080 | React + Vite — built to docs/ | README: "Web Interfaces", project structure docs/ |
| headless-shell | HTML-to-PDF/Image conversion subprocess | internal (no external port) | Chromium headless (chromedp/headless-shell base image) | README: "Google Chrome (for HTML conversion)"; dockerfolder/Dockerfile FROM chromedp/headless-shell:latest |
| auth.db | Auth user persistence | — | SQLite database on Docker volume | docker-compose.yml: volumes auth-data:/data; AUTH_DB_PATH=/data/auth.db |

**Key observation from dockerfolder/Dockerfile:** The main backend uses a two-stage build.
The builder stage uses `golang:1.24.11-bookworm`. The final runtime stage is based on
`chromedp/headless-shell:latest` (Debian 13.4 / Bookworm), which bundles the headless Chrome
binary at `/headless-shell/headless-shell`. The environment variable `CHROME_PATH` is set
to this path. The `docs/` directory is copied into the final image, confirming that the
React SPA is served from the Go binary, not a separate server.

**Key observation from auth-ms/Dockerfile:** The auth-ms uses `golang:1.25-alpine` for
building and `alpine:3.20` as the runtime base — a minimal footprint with no C libraries
(CGO_ENABLED=0). The database volume is explicitly declared (`VOLUME ["/data"]`).

---

## 2. Architectural Constraints (Expected — Pre-Inspection)

Six constraints derived from documentation artifacts (C1–C6). These represent what the
architecture *should* enforce, based on what the README and docker-compose.yml document.

| # | Constraint (Expected from README/Docs) | Evidence Source |
|---|----------------------------------------|-----------------|
| C1 | auth-ms exposes exactly three routes: `/auth/register`, `/auth/login`, `/auth/verify` and nothing else | README architecture description; docker-compose.yml — only port 9090 exposed; no other routes mentioned |
| C2 | JWT secret is shared between auth-ms and backend via the `AUTH_JWT_SECRET` environment variable | docker-compose.yml: `AUTH_JWT_SECRET: ${AUTH_JWT_SECRET:-dev-insecure-secret-change-me}` — same variable name implies sharing |
| C3 | HTML-to-PDF conversion uses headless Chrome (`gochromedp`) — Chromium must be installed in the backend image | README: "Requirements: Go 1.24+, Google Chrome (for HTML conversion)"; dockerfolder/Dockerfile: FROM chromedp/headless-shell:latest + CHROME_PATH env |
| C4 | Auth is required for all API calls (JWT Bearer token) | README: "Security & Compliance" feature bullet lists auth as a core feature; architecture description implies JWT middleware guards all /api/v1 endpoints |
| C5 | PDF generation is purely in-process with zero external service calls | README performance section: "In-memory processing with zero external dependencies"; "2 Nodes" infrastructure claim assumes no third-party PDF services |
| C6 | React frontend is a built SPA served from the Go backend's `docs/` directory at runtime | README project structure: `docs/ — Built frontend assets`; dockerfolder/Dockerfile: `COPY --from=builder /app/docs ./docs` |

---

## 3. DFD Level-1 (Expected — from Documentation)

The following Data Flow Diagram is derived from README and docker-compose.yml descriptions.
Trust boundary labels (TB1–TB4) are applied based on service roles and network exposure.

```
                           ┌──────────────────────────────────────────────────┐
                           │  TB1: Internet Perimeter                         │
                           │                                                  │
  [Browser / curl] ─── HTTPS ──► [React SPA :3000/dev OR embedded in :8080] │
                           │              │                                   │
                           │    JWT via Authorization header                  │
                           │              │                                   │
                           │ ┌────────────┼──────────────────────────┐       │
                           │ │            ▼                          │       │
                           │ │  ┌─────────────────┐                 │       │
                           │ │  │  auth-ms :9090  │  ◄── TB1        │       │
                           │ │  │  /auth/register  │                 │       │
                           │ │  │  /auth/login     │                 │       │
                           │ │  │  /auth/verify    │                 │       │
                           │ │  └────────┬────────┘                 │       │
                           │ │           │ JWT token returned        │       │
                           │ │           ▼                           │       │
                           │ │     [auth.db SQLite]                  │       │
                           │ │     (Docker volume)                   │       │
                           │ └──────────────────────────────────────┘       │
                           │              │              TB4: shared secret  │
                           │ ┌────────────▼──────────────────────────┐      │
                           │ │       Backend :8080             TB2    │      │
                           │ │  /api/v1/...  (JWT-gated)             │      │
                           │ │  /generate/template-pdf               │      │
                           │ │  /htmltopdf?url=<URL>                 │      │
                           │ │  /merge  /split  /fill                │      │
                           │ │  /fonts  (upload)                     │      │
                           │ │  /debug/pprof  (localhost only)       │      │
                           │ │         │                             │      │
                           │ │         ▼              TB3            │      │
                           │ │  [headless-shell Chromium]            │      │
                           │ │  (subprocess, no external port)       │      │
                           │ │         │                             │      │
                           │ │         ▼                             │      │
                           │ │  [External URL?] ──────────────────── │      │
                           │ │                  (SSRF risk)          │      │
                           │ │         │                             │      │
                           │ │         ▼                             │      │
                           │ │  [in-process PDF engine]              │      │
                           │ │  [in-process font registry]           │      │
                           │ └───────────────────────────────────────┘      │
                           └──────────────────────────────────────────────────┘
```

**Trust Boundary Definitions:**

| Boundary | Scope | Security Expectation |
|----------|-------|---------------------|
| TB1 | Internet ↔ auth-ms and Internet ↔ backend | JWT required (when AUTH_ENABLED=true or Cloud Run) |
| TB2 | Backend API surface | All /api/v1 endpoints require valid JWT Bearer token |
| TB3 | Backend ↔ headless Chromium subprocess | No URL allowlist — caller-supplied URL should be validated |
| TB4 | auth-ms ↔ backend JWT verification | Shared HS256 secret via AUTH_JWT_SECRET env var |

---

## 4. Conformance Check (Post-Inspection)

*This section was written after source code inspection. All file:line references cite actual code.*

*Post-inspection timestamp: 2026-06-01 — after Section 3 was complete and committed.*

For each constraint C1–C6, the following source files were inspected:
- `auth-ms/server.go` — auth-ms route definitions (C1)
- `auth-ms/main.go`, `auth-ms/token.go` — JWT secret usage (C2)
- `internal/pdf/pdf.go` — Chromium invocation via gochromedp (C3)
- `internal/middleware/auth.go` — auth enforcement logic (C4)
- `internal/pdf/font/pdfa.go` — external HTTP call for font download (C5)
- `internal/handlers/handlers.go` — SPA serving and route registration (C6)

| # | Constraint | Status | Evidence (file:line) | Notes |
|---|-----------|--------|----------------------|-------|
| C1 | auth-ms exposes only /auth/register, /auth/login, /auth/verify | ⚠ Partial | auth-ms/server.go:16 (health), :21 (register), :22 (login), :23 (verify) | auth-ms defines a fourth route `/health` in addition to the three documented auth routes. The constraint text specifies "and nothing else" — the `/health` endpoint is a deviation. While operationally justified (health checks), it is a departure from the documented interface contract. |
| C2 | JWT secret shared via AUTH_JWT_SECRET env var | ✅ Conforms | auth-ms/main.go:17 (`secret := env("AUTH_JWT_SECRET", "dev-insecure-secret-change-me")`); internal/middleware/auth.go:36 (`os.Getenv("AUTH_JWT_SECRET")`) | Both services read the same `AUTH_JWT_SECRET` env variable at startup. The default fallback `"dev-insecure-secret-change-me"` matches in both; this shared default is a known security weakness (see STRIDE T-04-01). |
| C3 | HTML-to-PDF uses headless Chromium via gochromedp | ✅ Conforms | internal/pdf/pdf.go:51 (`gochromedp.ConvertHTMLToPDF`); internal/pdf/pdf.go:55 (`gochromedp.ConvertURLToPDF`) | Both HTML content and URL-based conversion paths route through the `gochromedp` library, which wraps the headless Chrome subprocess. The URL path passes `req.URL` directly to `ConvertURLToPDF` without validation — a confirmed SSRF vector (STRIDE T-04-02). |
| C4 | Auth required for all API calls | ⚠ Partial | internal/middleware/auth.go:18 (`var authEnabledCached = os.Getenv("AUTH_ENABLED") == "true"`); auth.go:26 (`func authRequired() bool { return authEnabledCached \|\| isCloudRunCached }`) | Auth enforcement is conditional: it is only active when `AUTH_ENABLED=true` or running on Cloud Run (K_SERVICE env set). Locally, `AUTH_ENABLED` defaults to unset, so all `/api/v1` endpoints are accessible without any token. This is a deliberate developer-experience decision but violates the documentation claim that auth is a core security feature. |
| C5 | PDF generation is purely in-process, no external calls | ⚠ Partial | internal/pdf/font/pdfa.go:238 (`resp, err := http.Get(liberationFontsArchiveURL)`) | The README claims "zero external dependencies" but the PDF/A font manager makes an outbound HTTP GET to download Liberation fonts from a GitHub release URL when PDF/A compliance is requested and fonts are not cached locally. This is flagged as G107 by gosec. Normal PDF generation (non-PDF/A) does not trigger this call. |
| C6 | React SPA served from docs/ by Go backend | ✅ Conforms | internal/handlers/handlers.go:93 (`router.Static("/gopdfsuit/assets", filepath.Join(base, "docs", "assets"))`); handlers.go:160 (`router.NoRoute(handleSPA)`); handlers.go:166 (`indexPath := filepath.Join(base, "docs", "index.html")`) | The Go router serves static assets from `docs/assets` and falls back to `docs/index.html` for all unrecognized routes (SPA routing pattern). This matches the Dockerfile which copies `docs/` into the runtime image. |

**Conformance Summary:**
- ✅ Conforms: C2, C3, C6 (3 of 6 constraints fully met)
- ⚠ Partial: C1, C4, C5 (3 of 6 constraints partially met)
- ❌ Violated: none

The three partial conformances represent known deviations: C1 has an undocumented `/health`
route that exceeds the stated constraint; C4 is an intentional auth-disable for local dev
experience; C5 is an edge-case external call on the PDF/A compliance path only. All three
are documented, and C4 and C5 are registered as STRIDE threats in the threat model.
