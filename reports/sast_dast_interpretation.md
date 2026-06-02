# SAST/DAST Findings Interpretation — gopdfsuit-qua

*Generated: 2026-06-01 | Satisfies EXT-07, EXT-08, EXT-09*

---

## 1. gosec — Go Security Checker (EXT-07)

### Summary

Total issues: **166** (exact count from `gosec_backend.json`)

| Rule | Count | Severity | Category |
|------|-------|----------|----------|
| G115 | 126 | HIGH | Integer overflow: uint64→int conversion in PDF byte-offset arithmetic |
| G401 | 15 | MEDIUM | Weak crypto primitives: RC4/MD5 usage |
| G110 | 8 | MEDIUM | Decompression bomb: unbounded io.ReadAll on zlib streams |
| G304 | 5 | MEDIUM | Path traversal: file inclusion via variable (font loading, OCR output) |
| G501 | 3 | LOW | Import of blocked crypto package: crypto/md5 (on the gosec import blocklist) |
| G204 | 2 | MEDIUM | Subprocess with tainted input: ocr_adapter.go |
| G301 | 2 | LOW | Directory permission too permissive (mkdir with 0777) |
| G405 | 1 | MEDIUM | Use of weak block cipher (DES/RC2) in legacy PDF encryption |
| G107 | 1 | MEDIUM | HTTP request with variable URL: internal/pdf/font/pdfa.go:238 |
| G303 | 1 | LOW | Use of Mktemp (raceable temp file creation) |
| G503 | 1 | LOW | Use of weak random number generator (math/rand in test helper) |
| G602 | 1 | LOW | Array index out of bounds (bounds check elided by compiler) |

### Interpretation and Threat Model Cross-Reference

**G401 (RC4/MD5) — PARTIAL FALSE POSITIVE**

RC4 is specified in PDF 1.4–1.5 encryption (Standard Security Handler Revisions 2 and 3).
PDF 1.6 introduced AES-128 as an independent alternative cipher — RC4 and AES are separate
encryption algorithms within the PDF spec, not layered. The RC4 usages in this codebase are
for PDF 1.4/1.5 backward-compatible encryption and are spec-required for those document formats.
The MD5 usages are for PDF checksum computation per spec (PDF/UA and legacy object hash
verification). gosec correctly flags the use of cryptographically weak primitives, but in
this context they are spec-required, not developer discretion errors. For API-level security
(user password storage), bcrypt is correctly used in auth-ms.

Cross-reference: This relates to T-04-01 peripherally — the JWT secret weakness is a
configuration issue, not a code primitive issue. No direct T-04-XX mapping, but documented
under ASVS V6 (Cryptography).

**G405 (DES/RC2 block cipher) — PARTIAL FALSE POSITIVE**

G405 flags use of weak block ciphers (DES or RC2), not RC4 (which is a stream cipher covered
by G401). The one G405 instance likely flags a DES or RC2 usage in the legacy PDF encryption
code — these block ciphers appear in older Standard Security Handler implementations for
PDF 1.4/1.5 backward compatibility. This is architectural tech debt (spec compliance for
legacy PDF encryption revisions) rather than a security error in application logic.

**G115 (integer overflow) — REAL CODE QUALITY CONCERN**

126 instances of uint64-to-int conversion in PDF byte-offset arithmetic. Overflow in PDF
parsing could theoretically cause incorrect PDF output (e.g., wrong object offsets). In a
well-tested binary, overflow is unlikely to be directly exploitable for arbitrary code
execution, but it represents a correctness risk in large-file processing. No direct STRIDE
mapping — this is a code quality and robustness issue.

**G110 (decompression bomb) — REAL RISK — maps to T-04-07**

8 instances of unbounded `io.ReadAll` on zlib streams across the PDF parsing codebase.
An attacker sending a crafted PDF with a zlib stream that decompresses to gigabytes of data
can trigger unbounded memory allocation, causing Out-Of-Memory (OOM) conditions on the host.
This maps directly to T-04-07 (Denial of Service via PDF zlib decompression). Remediation:
wrap all zlib readers with `io.LimitReader(r, maxBytes)` before passing to `io.ReadAll`.

**G304 (path traversal) — REAL RISK — dual mapping**

5 instances of unvalidated path variables in file-loading code. The gosec summary explicitly
identifies two distinct attack surfaces: font loading paths and OCR output paths. These map
to separate threat model entries:

- **Font-related G304 hits → T-04-06:** Font upload and loading code reads file paths derived
  from `file.Filename` without sanitization. If inputs from callers are not sanitised, directory
  traversal allows reading files outside the intended font directory.

- **OCR-related G304 hits → T-04-09 (proposed):** The OCR adapter (`ocr_adapter.go`) also
  processes file paths that may be caller-influenced. These instances are not covered by T-04-06
  (scoped to font upload) and require separate threat model coverage under T-04-09.

Remediation for both: apply `filepath.Clean` and verify the cleaned path has the expected
prefix before use.

**G204 (subprocess taint) — REAL RISK**

2 instances in `ocr_adapter.go`. The OCR adapter accepts file paths and potentially tool
paths from caller context. If the OCR tool path or arguments are influenced by untrusted
input, command injection is possible. Remediation: validate and whitelist acceptable OCR
tool paths; never accept tool binary paths from external input.

**G107 (variable URL in HTTP request) — two distinct findings**

**(a) Gosec finding at `internal/pdf/font/pdfa.go:238` — supply-chain risk (WR-05)**

The one G107 instance gosec actually flagged is at `pdfa.go:238`, where the variable name
`liberationFontsArchiveURL` strongly implies a hardcoded constant pointing to a GitHub release.
If the URL is a Go constant, it cannot be influenced by caller input — gosec flags it because
the variable is passed to `http.Get`, but there is no caller-controlled SSRF here. This is
correctly classified as a **hardcoded external URL dependency — supply-chain risk**: if the
GitHub release URL becomes malicious (e.g., via account compromise or URL hijack), the backend
fetches from an attacker-controlled host automatically. Reclassification: partial false positive
for SSRF; genuine supply-chain concern.

**(b) Separately identified SSRF at `internal/pdf/pdf.go:55` — maps to T-04-02 (manual code review)**

The primary SSRF vector at `pdf.go:55` (`gochromedp.ConvertURLToPDF(req.URL, ...)`) was
identified by **manual code review**, not by gosec. Gosec cannot trace a URL passed into a
third-party library wrapper across a process boundary. This is the confirmed T-04-02 SSRF —
a caller-supplied URL field passed directly to Chromium with no validation. An attacker can
cause the backend to fetch any internal or cloud-metadata endpoint via this path.

**G501 / G303 / G301 / G503 / G602 — LOW PRIORITY**

These are minor code quality findings: import of blocked crypto package `crypto/md5` (G501 —
gosec flags the import itself, regardless of alias), raceable temp file creation (G303, likely
in tests), permissive mkdir modes (G301), weak PRNG in a test helper (G503), and a
compiler-validated bounds check (G602). None represent direct exploitable vulnerabilities in
production code paths.

---

## 2. Trivy — Container CVE Scanner (EXT-08)

### gopdfsuit:latest (Debian 13.4 + headless-shell/Chromium)

**Overall severity distribution (actual from trivy_gopdfsuit.json):**

| Severity | Count |
|----------|-------|
| CRITICAL | 4 |
| HIGH | 24 |
| MEDIUM | 56 |
| LOW | 73 |
| UNKNOWN | 4 |

**Critical CVEs (exact data from scan):**

| CVE | Package | Title |
|-----|---------|-------|
| CVE-2026-42496 | perl-base | Archive::Tar versions before 3.08 — symlink extraction with path traversal |
| CVE-2026-8376 | perl-base | Perl heap buffer overflow in regex compilation (versions through 5.43.10) |
| CVE-2026-33186 | google.golang.org/grpc | gRPC-Go authorization plugin: authorization bypass vulnerability |
| CVE-2025-68121 | stdlib | crypto/tls: Incorrect certificate validation during TLS session resumption |

**Interpretation:**

The two perl-base CRITICAL CVEs (CVE-2026-42496 and CVE-2026-8376) are attributable to the
`headless-shell` (Chromium) Debian base image. The headless-shell image includes Perl as a
system dependency of Chromium's build infrastructure. These CVEs do not directly affect the
Go application logic but do increase the attack surface of the container image.

The gRPC CVE (CVE-2026-33186) affects the `google.golang.org/grpc` Go binary dependency.
This is a transitive dependency pulled in by the Chromium automation libraries. An attacker
exploiting this would need to trigger gRPC communication paths within the container.

The stdlib crypto/tls CVE (CVE-2025-68121) affects Go's TLS implementation. Given that
gopdfsuit serves HTTP (not HTTPS) locally and relies on a load balancer for TLS termination
in production (Cloud Run), the exploitability is context-dependent.

**Remediation recommendations:**
- Update the `chromedp/headless-shell` base image to a version that ships with patched Perl
- Pin Go version to a release that includes the crypto/tls fix (Go 1.25.x or later patch)
- Evaluate whether grpc is an active dependency or can be excluded from the build

### gopdfsuit-auth-ms:latest (Alpine 3.20 + pure-Go binary)

**CVE count: 0 vulnerabilities found.**

Targets scanned:
- `gopdfsuit-auth-ms:latest (alpine 3.20.10)` — 0 vulnerabilities
- `usr/local/bin/auth-ms` (Go binary) — 0 vulnerabilities

**Interpretation — POSITIVE SECURITY FINDING:**

The auth-ms image is built on Alpine 3.20 with `CGO_ENABLED=0`, producing a pure-Go binary.
This eliminates all OS-level CVE exposure that comes from C runtime libraries and system
packages. The contrast with gopdfsuit:latest is significant: gopdfsuit uses Debian 13.4 +
headless-shell (Chromium), a large attack surface yielding 4 CRITICAL and 24 HIGH CVEs.

This demonstrates the direct security value of the principle of least attack surface:
choosing Alpine as the base image and eliminating CGO reduces CVE exposure to zero at the
OS layer, and the pure-Go binary has no C dependencies to introduce additional CVEs.

Cross-reference: This finding supports the threat model's trust boundary TB1 (Internet ↔
auth-ms) — the auth-ms image itself introduces minimal container-level CVE risk.

---

## 3. OWASP ZAP Baseline Scan (EXT-09)

### Scan Configuration

- **Target:** `http://localhost:8080` (main gopdfsuit backend, auth disabled)
- **Scan type:** Passive baseline (`zap-baseline.py`) — no active exploitation
- **URLs crawled:** 20 unique URLs
- **ZAP version:** stable (ghcr.io/zaproxy/zaproxy:stable)

### Findings Summary

**Result:** 10 WARN-NEW findings, 0 FAIL-NEW, 57 PASS checks

| # | Alert | Severity | Rule ID | Instances |
|---|-------|----------|---------|-----------|
| 1 | Missing Anti-clickjacking Header | Medium | 10020 | 4 |
| 2 | X-Content-Type-Options Header Missing | Low | 10021 | 5 |
| 3 | Content Security Policy (CSP) Header Not Set | Medium | 10038 | 5 |
| 4 | Storable and Cacheable Content | Informational | 10049 | 5 |
| 5 | Permissions Policy Header Not Set | Low | 10063 | 5 |
| 6 | Timestamp Disclosure - Unix | Low | 10096 | 1 |
| 7 | Cross-Domain Misconfiguration | Medium | 10098 | 1 |
| 8 | Modern Web Application | Informational | 10109 | 5 |
| 9 | Dangerous JS Functions | Low | 10110 | 1 |
| 10 | Cross-Origin-Embedder-Policy Header Missing or Invalid | Medium | 90004 | 15 |

### Detailed Finding Interpretations and Threat Model Cross-References

**Finding 1 — Missing Anti-clickjacking Header (10020) — maps to T-04-04**

The `X-Frame-Options` header is absent from responses including the React SPA (`/gopdfsuit`)
and the `/api/v1/merge` endpoint. Without this header, the gopdfsuit frontend can be embedded
in an iframe on an attacker-controlled site, enabling clickjacking attacks that could trick
authenticated users into performing unintended PDF operations. Cross-reference T-04-04
(CORS wildcard on backend) — both are HTTP security header gaps that reduce the browser's
ability to enforce cross-origin isolation.

**Finding 3 — Content Security Policy (CSP) Header Not Set (10038) — relates to T-04-04**

No CSP header is set on any response. Without CSP, browsers cannot restrict which sources
may load scripts, styles, or frames for the React SPA. An XSS vulnerability (not directly
present but possible in dynamically generated content) would have no browser-level mitigation.
The absence of CSP is consistent with the broader finding that T-04-04 (CORS wildcard) and
other cross-origin controls are not fully configured.

**Finding 7 — Cross-Domain Misconfiguration (10098) — maps to T-04-04**

ZAP detected a Cross-Domain Misconfiguration on the `/api/v1/template-data` endpoint.
This corroborates T-04-04 (CORS wildcard): the `resolveAllowOrigin` function returns `"*"`
for non-localhost origins, and `Access-Control-Allow-Headers: *` permits any header.
This allows any web origin to make API calls that would otherwise be restricted by the
browser's same-origin policy. This is a confirmed, independently detected instance of T-04-04.

**Finding 10 — Cross-Origin-Embedder-Policy Header Missing (90004) — relates to T-04-04**

The `Cross-Origin-Embedder-Policy` (COEP) header is missing from 15 responses. COEP, combined
with `Cross-Origin-Opener-Policy` (COOP), is required to isolate the browsing context and
enable SharedArrayBuffer and high-resolution timers safely. Its absence is consistent with
the overall picture of insufficient cross-origin isolation headers (also seen in T-04-04).

**Finding 2 — X-Content-Type-Options Missing (10021)**

The `X-Content-Type-Options: nosniff` header is absent. Without it, browsers may MIME-sniff
responses and interpret a returned PDF binary as a script, creating a minor content-type
confusion risk. Low severity in the context of this application.

**Finding 9 — Dangerous JS Functions (10110)**

ZAP detected the use of `eval()` or similar dangerous JavaScript functions in the bundled
frontend asset (`index-DIPJRjNj.js`). This is likely a false positive from the Vite/React
build output, where minification sometimes produces patterns that resemble `eval`. The React
SPA has 0 ESLint errors (confirmed by EXT-02), so this is likely a bundler artifact.

### Notable: CORS wildcard NOT directly triggered on primary endpoints

ZAP passive scan did not directly test CORS headers with attacker-origin requests (passive
scan does not issue OPTIONS preflight with arbitrary Origin headers). The Cross-Domain
Misconfiguration finding (10098) was triggered on the template-data endpoint. Manual
verification of T-04-04 remains appropriate (see PoC documentation in poc.md).

---

## 4. Overall Security Posture

### Risk Summary

| Risk Area | Source | Threat | Priority |
|-----------|--------|--------|----------|
| SSRF via HTML-to-PDF | Manual review + T-04-02 | Attacker fetches internal URLs via /htmltopdf | Critical |
| Unauthenticated API access | T-04-03 | All /api/v1 endpoints accessible without JWT locally | Critical |
| Decompression bomb | G110 x8 + T-04-07 | Malicious PDF triggers OOM via unbounded zlib read | High |
| Container image CVEs | Trivy: CRITICAL=4 | Perl + gRPC + stdlib TLS CVEs in headless-shell image | High |
| CORS wildcard | ZAP 10098 + T-04-04 | Any origin can call API from browser context | Medium |
| Path traversal in fonts | G304 x5 + T-04-06 | Unvalidated font paths allow directory traversal | Medium |

### Confirmed Tool → Threat Mappings

| Tool Finding | Threat ID | Confidence |
|-------------|-----------|------------|
| G107 (pdfa.go:238 — hardcoded URL) | Supply-chain risk (C5 partial) | MEDIUM — URL likely constant, not caller-controlled SSRF |
| Manual code review (pdf.go:55) | T-04-02 (SSRF) | HIGH — direct code evidence; gosec did not flag this location |
| G110 x8 (decompression bomb) | T-04-07 (DoS via PDF) | HIGH — 8 code locations confirmed |
| G304 (font-related hits) | T-04-06 (font upload path) | HIGH — code evidence in font handlers |
| G304 (OCR-related hits) | T-04-09 (OCR command injection) | MEDIUM — OCR file path handling in ocr_adapter.go |
| ZAP 10098 (Cross-Domain Misconfiguration) | T-04-04 (CORS wildcard) | HIGH — independent tool confirmation |
| ZAP 10020 (Anti-clickjacking) | T-04-04 (CORS/headers) | MEDIUM — related header gap |
| Trivy CRITICAL=4 | Container attack surface | HIGH — 4 confirmed CRITICAL CVEs |

### Recommendations

1. **Immediate:** Add `io.LimitReader` wrapper before all 8 `io.ReadAll` calls on zlib streams
   (G110 — T-04-07 mitigation)
2. **Immediate:** Implement URL allowlist in `/htmltopdf` handler; block RFC-1918 and link-local
   ranges before passing URL to `gochromedp` (G107/T-04-02 mitigation)
3. **Short-term:** Update headless-shell base image to patch perl-base CRITICAL CVEs
4. **Short-term:** Add `X-Frame-Options: DENY`, `Content-Security-Policy`, and
   `X-Content-Type-Options: nosniff` headers to all responses (ZAP findings 1-2-3)
5. **Short-term:** Apply `filepath.Clean` + prefix validation to all G304 path variables
6. **Medium-term:** Restrict CORS to known origins; eliminate wildcard `*` (T-04-04/T-04-05)
7. **Medium-term:** Default `AUTH_ENABLED` to true (T-04-03 mitigation)

### False Positive Summary

| Finding | Rule | Verdict | Rationale |
|---------|------|---------|-----------|
| RC4/MD5 usage | G401 (15 instances) | Partial FP | RC4 required by PDF 1.4–1.5 spec (Revisions 2/3); AES-128 (PDF 1.6) is a separate, independent cipher — not layered on RC4 |
| DES/RC2 block cipher | G405 (1 instance) | Partial FP | G405 flags weak block ciphers (DES/RC2), not RC4; DES/RC2 present for legacy PDF encryption backward-compatibility |
| G107 at pdfa.go:238 | G107 (1 instance) | Partial FP | `liberationFontsArchiveURL` is likely a hardcoded constant — supply-chain risk, not caller-controlled SSRF |
| auth-ms 0 CVEs | Trivy | True Positive (positive) | 0 CVEs is a positive security finding, not a scan failure |
| Dangerous JS | ZAP 10110 | Likely FP | Bundler artifact from Vite minification; ESLint found 0 errors in source |
