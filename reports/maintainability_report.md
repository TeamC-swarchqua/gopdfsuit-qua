# Maintainability Report — gopdfsuit-qua

**Date:** 2026-06-01
**Phase:** 04 — Lab Extension
**Requirement satisfied:** EXT-05
**Tools used:** golangci-lint v2.12.2 (Go), ESLint v8.55.0 (React frontend)

---

## 1. Static Analysis Results Summary

### Go Backend (golangci-lint v2.12.2)

Source: `reports/golangci_backend.json` (8.2 KB, 16 findings)

| Rule | Count | Severity | Category |
|------|-------|----------|----------|
| errcheck | 12 | MEDIUM | Unchecked error returns |
| staticcheck QF1012 | 3 | LOW | `WriteString(fmt.Sprintf(...))` → `fmt.Fprintf` |
| staticcheck S1039 | 1 | LOW | Unnecessary `fmt.Sprintf` in test |
| **Total** | **16** | | |

**Qualitative assessment:** The 12 `errcheck` violations are all confined to test code
(`new_tests/backend/flow_test.go`) — there are zero production-path unchecked error returns
(verified from `golangci_backend.json`). The three `QF1012` issues (in `encryption/encrypt.go`,
`merge/merger.go`, `merge/split.go`) indicate style inconsistency — `WriteString(fmt.Sprintf(...))` 
allocates an extra string; `fmt.Fprintf` avoids this. These are low-severity code quality issues,
not correctness bugs.

Note: Go has no direct Maintainability Index (MI) equivalent to Radon (Python). The
`golangci-lint` multi-linter run is the Go-idiomatic quality gate; it combines static
analysis from 60+ linters in one pass (similar role to ESLint + Radon combined).

### React Frontend (ESLint v8.55.0)

Source: `reports/eslint_frontend.json` (21 KB, 53 files analyzed)

| Metric | Value |
|--------|-------|
| Files analyzed | 53 |
| Errors | 0 |
| Warnings | 0 |
| Rules enforced | eslint-plugin-react, eslint-plugin-react-hooks, react-refresh |

**Qualitative assessment:** The React frontend is clean under all configured rules.
Zero findings across 53 files indicates consistent code style and correct React Hooks usage.
Coverage gap: `prop-types` enforcement is disabled in `.eslintrc.cjs`; TypeScript rules are
absent (project uses plain JSX). Runtime type errors in props are therefore not caught
statically. This is an acceptable trade-off for a JSX project without TypeScript.

---

## 2. Coupling and Cohesion Analysis

### Architectural Responsibility Map

Source: `04-RESEARCH.md` Section "Architectural Responsibility Map" + source inspection.

The Go backend is organized into clearly named packages. The coupling analysis below
examines efferent coupling (number of external packages a module depends on) and
cohesion (whether a module has a single, focused responsibility).

### Efferent Coupling per Module

**`internal/handlers/handlers.go`** — HIGH efferent coupling

Imports: `archive/zip`, `bytes`, `fmt`, `io`, `log`, `net/http`, `net/http/pprof`,
`os`, `path/filepath`, `strconv`, `strings` (stdlib, 12 imports) +
`github.com/bytedance/sonic`, `internal/middleware`, `internal/models`,
`internal/pdf`, `internal/pdf/form`, `internal/pdf/merge`, `github.com/gin-gonic/gin`
(external + internal, 7 imports).

**Total: ~19 import paths.** This is the classic orchestrator anti-pattern in Gin handlers:
a single file coordinates PDF generation, font upload, template rendering, auth test, merge,
split, form fill, redaction, pprof routing, and SPA serving. High efferent coupling is
expected for a handler layer, but the concentration of 14+ distinct API endpoints in a
single file creates a high change-impact surface — any PDF library or middleware change
forces a retest of all endpoint logic.

**`internal/pdf/pdf.go` and the `pdf` package** — MEDIUM efferent coupling

Imports: `github.com/chinmay-sawant/gochromedp/pkg/gochromedp`, `internal/models`,
`fmt`, `log` (4 import paths). The package is split into sub-files by responsibility
(`generator.go`, `pagemanager.go`, `draw.go`, `xfdf.go`, etc.), which is a positive
decomposition pattern. The tight coupling to `gochromedp` is unavoidable for
Chromium-based conversion but introduces an untestable dependency (see TG-3).

**`internal/middleware/auth.go`** — LOW efferent coupling

Imports: `net/http`, `os`, `strings`, `github.com/gin-gonic/gin`,
`github.com/golang-jwt/jwt/v5` (5 import paths). Single clear responsibility:
JWT verification + request gating. Well-scoped.

**`internal/middleware/cors.go`** — LOW efferent coupling

Imports: `net/http`, `net/url`, `os`, `strings`, `github.com/gin-gonic/gin` (5 import paths).
Single responsibility: CORS header management. Well-scoped.

**`auth-ms/` (separate binary)** — LOW-MEDIUM efferent coupling

auth-ms is a self-contained binary with its own `go.mod`. Dependencies: `gin`, `bcrypt`,
`modernc/sqlite`, `golang-jwt/jwt/v5`. Clean boundary: only issues JWTs, never reads
gopdfsuit backend state. Isolation is a maintainability strength.

### Cohesion Assessment

| Module | Cohesion | Assessment |
|--------|----------|------------|
| `internal/handlers/handlers.go` | LOW | 14+ API endpoints, pprof routing, SPA serving, and project root resolution in one file. Does not adhere to single-responsibility principle. Refactor target. |
| `internal/pdf/` package | HIGH | PDF-only operations split across thematic sub-files. The sub-file decomposition (`generator.go`, `pagemanager.go`, `draw.go`) is a positive pattern. |
| `internal/middleware/auth.go` | HIGH | Single cross-cutting concern: JWT parsing and request gating. |
| `internal/middleware/cors.go` | HIGH | Single cross-cutting concern: CORS header resolution. |
| `auth-ms/` | HIGH | Handles registration, login, JWT issuance, and SQLite persistence — all within a single auth domain. Well-isolated binary. |

### Separation of Concerns Observation

`internal/middleware/auth.go` mixes business logic (reading `AUTH_ENABLED` env var,
falling back to insecure default JWT secret) with HTTP infrastructure concerns
(parsing the `Authorization: Bearer` header). A cleaner design would separate
`AuthConfig` (configured at startup from env vars) from `AuthMiddleware` (a Gin
handler factory that accepts an `AuthConfig`). This would make the configuration
testable without env mutation (see TG-2).

---

## 3. Testability Gap Analysis

Source: `04-RESEARCH.md` Section "Testability Gaps". All four pre-identified gaps are
confirmed by source code inspection.

### Gap 1 (TG-1): Font Registry Global State

- **Location:** `internal/pdf/font/registry.go:39`
- **Problem:** `var globalFontRegistry = &CustomFontRegistry{...}` is a package-level
  singleton. `GetFontRegistry()` at `registry.go:44` always returns this same instance.
  Any font registered by one test persists into subsequent tests. Parallel tests that
  upload or register fonts will race on `globalFontRegistry.mu` (the mutex provides
  safety for concurrent access, but does not provide isolation between test cases).
- **Impact:** Unit tests for font upload (`handleUploadFont`) or PDF/A generation
  (`internal/pdf/generator.go:101`) cannot run in parallel safely. A test that registers
  a "TestFont" will affect all later tests in the same process. Flaky test failures
  depend on test execution order — a hallmark of global state anti-patterns.
- **Proposal:** Remove the package-level singleton. Inject a `*font.CustomFontRegistry`
  as a constructor parameter to handler initialization (e.g., `NewHandlers(registry
  *font.CustomFontRegistry)` style). Tests create an isolated registry per test case
  via `font.NewFontRegistry()` (the constructor already exists at `registry.go:49`).
  This changes the API surface of `GetFontRegistry()` from a global function to an
  injected dependency — a standard Go refactoring pattern.

### Gap 2 (TG-2): Auth Toggle Cached at Init Time

- **Location:** `internal/middleware/auth.go:18`
- **Problem:** `var authEnabledCached = os.Getenv("AUTH_ENABLED") == "true"` is evaluated
  once at package initialization (package-init time in Go). Calling `os.Setenv("AUTH_ENABLED",
  "true")` in a test after the package is loaded has no effect on `authEnabledCached`. Tests
  cannot enable or disable auth behavior without restarting the process — making auth-dependent
  endpoint tests impossible without environment-level setup (e.g., `TestMain` with `os.Setenv`
  before any imports resolve).
- **Impact:** Tests for auth-protected endpoints cannot toggle auth on/off mid-suite.
  Integration tests that want to verify "unauthenticated request returns 401" and
  "authenticated request returns 200" in the same test binary require two separate
  processes or hackery via `reflect` to mutate the package variable.
- **Proposal:** Replace the cached variable with an `AuthConfig` struct initialized at
  server startup:
  ```go
  type AuthConfig struct { Enabled bool; JWTSecret string }
  func NewAuthConfigFromEnv() AuthConfig { ... }
  func AuthMiddleware(cfg AuthConfig) gin.HandlerFunc { ... }
  ```
  Tests inject a constructed `AuthConfig{Enabled: true}` without env mutation.
  This is also a prerequisite for supporting runtime auth reconfiguration in the future.

### Gap 3 (TG-3): handleHTMLToPDF Has No Interface Abstraction

- **Location:** `internal/handlers/handlers.go` (htmltopdf handler); `internal/pdf/pdf.go:22`
- **Problem:** The `handleHTMLToPDF` handler calls `pdf.ConvertHTMLToPDF(req)` directly —
  a package-level function with no interface. There is no `PDFConverter` interface that
  a mock could satisfy. The real `ConvertHTMLToPDF` invokes `gochromedp.ConvertURLToPDF`,
  which requires a running headless Chrome process.
- **Impact:** Unit-testing the handler logic (request parsing, error handling, response
  formatting) requires a full Chromium process. Without a mock, handler unit tests are
  actually integration tests. CI environments without Chrome installed cannot run these
  tests at all. The Chromium startup cost (~300ms) makes fast feedback loops impractical.
- **Proposal:** Define a `PDFConverter` interface in the `pdf` package:
  ```go
  type PDFConverter interface {
      ConvertHTMLToPDF(req models.HTMLToPDFRequest) ([]byte, error)
      ConvertHTMLToImage(req models.HTMLToImageRequest) ([]byte, error)
  }
  ```
  Inject the concrete implementation (wrapping `gochromedp`) at server startup.
  In tests, inject a `MockPDFConverter` that returns fixed bytes or a controlled error.
  This decouples handler logic from Chromium lifecycle entirely.

### Gap 4 (TG-4): handleUploadFont Reads Gin Context Directly

- **Location:** `internal/handlers/handlers.go` (handleUploadFont handler)
- **Problem:** The font upload handler reads the multipart file directly from the Gin
  context via `c.FormFile("font")`. The font validation logic (extension check, registry
  registration) is embedded inside the HTTP handler function without extraction into a
  service layer. Testing requires constructing a valid `multipart/form-data` HTTP request,
  which is verbose with `net/http/httptest` and couples the test to Gin's request parsing.
- **Impact:** Tests for font validation rules (extension check, duplicate registration,
  maximum size) must construct full HTTP requests with multipart bodies. The `FontRegistry`
  state (Gap 1) compounds this: each test must manage registry state to avoid pollution.
  There is no way to test the "font file too large" or "invalid extension" rule without
  going through the full HTTP stack.
- **Proposal:** Extract a `FontService` type that accepts an `io.Reader` + filename:
  ```go
  type FontService struct { registry *font.CustomFontRegistry }
  func (s *FontService) RegisterUploadedFont(name string, data io.Reader) error { ... }
  ```
  The handler becomes a thin adapter: extract the file from `c.FormFile`, call
  `fontService.RegisterUploadedFont(header.Filename, file)`. Tests for the service use
  `bytes.NewReader(fakeFontBytes)` without any HTTP machinery.

---

## 4. Coupling Metric Summary Table

| Module | Efferent Coupling | Cohesion | Testability |
|--------|------------------|----------|-------------|
| `internal/handlers/handlers.go` | HIGH (~19 imports) | LOW (14+ responsibilities) | POOR — Gin-dependent; global registry; no PDFConverter interface |
| `internal/pdf/` package | MEDIUM (gochromedp tight coupling) | HIGH (thematic sub-files) | POOR — Chromium-dependent; no converter interface for mocking |
| `internal/middleware/auth.go` | LOW (5 imports) | HIGH (single concern) | FAIR — env var init-time cache (TG-2) prevents test toggling |
| `internal/middleware/cors.go` | LOW (5 imports) | HIGH (single concern) | GOOD — pure function logic; easily unit-tested with fake gin.Context |
| `auth-ms/` binary | LOW-MEDIUM (own go.mod) | HIGH (auth domain only) | FAIR — SQLite dependency requires test DB setup; bcrypt adds test latency |

---

## 5. Conclusions and Recommendations

### Overall Assessment

The Go backend has reasonable maintainability metrics at package level but suffers from
testability anti-patterns common in Gin-style Go projects. With 16 golangci-lint findings
(all LOW-MEDIUM severity, no CRITICAL), the static analysis picture is acceptable for a
production codebase of this scope. The React frontend (0 ESLint findings across 53 files)
is clean and well-structured.

### Primary Concerns

1. **Global font registry (TG-1):** Prevents parallel test execution and causes order-dependent
   test failures. This is the highest-priority testability fix before the next feature addition.

2. **Auth toggle cached at init time (TG-2):** Makes auth middleware untestable without
   process restart. The `AuthConfig` struct refactoring is low-effort, high-value.

3. **No interface abstraction on PDF converter (TG-3):** Forces Chromium startup for every
   handler unit test. Introducing a `PDFConverter` interface would immediately enable fast,
   hermetic handler tests.

4. **Unchecked errors in test code (errcheck × 12):** All 12 errcheck violations are in
   `new_tests/backend/flow_test.go`, not in production code. These carry low practical risk
   but should be suppressed with `//nolint:errcheck` + justification comments for clarity.

### Priority Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 1 | Introduce `PDFConverter` interface; inject mock in tests | Medium | Eliminates Chromium dependency from unit tests |
| 2 | Replace `authEnabledCached` with `AuthConfig` struct | Low | Enables auth middleware unit tests |
| 3 | Inject `FontRegistry` into handlers; remove global singleton | Medium | Enables parallel tests; eliminates font state pollution |
| 4 | Extract `FontService` from handler (TG-4) | Low | Simplifies font upload unit testing |
| 5 | Suppress test-file `errcheck` violations in `new_tests/` with `//nolint:errcheck` | Low | Clarifies intentional test teardown patterns |

The `auth-ms` service has no critical testability concerns — it is well-isolated with a
minimal dependency graph. The React frontend requires no maintainability improvements at
this time.
