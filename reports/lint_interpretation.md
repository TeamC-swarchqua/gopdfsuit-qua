# Lint Interpretation Report — gopdfsuit-qua

**Generated:** 2026-06-01
**Phase:** 04 — Lab Extension (gopdfsuit-qua)
**Requirements:** EXT-01 (golangci-lint Go backend), EXT-02 (ESLint React frontend)

---

## 1. golangci-lint — Go Backend

### Tool Configuration

- **Tool:** golangci-lint v2.12.2 (Docker image: `golangci/golangci-lint:latest`, built 2026-05-06)
- **Command:** `golangci-lint run --output.json.path=/app/reports/golangci_backend.json --timeout 120s ./...`
- **Flag note:** `--output.json.path` is the v2 syntax. The old v1 flag `--out-format json` was removed in golangci-lint v2.0.0 (2024). Using the old flag results in an "unknown flag" error.
- **Scope:** All Go packages under `gopdfsuit-qua/` (backend + auth-ms + internal packages)
- **Report file:** `gopdfsuit-qua/reports/golangci_backend.json` (8.2 KB)

### Findings Summary

**Total issues: 16**

| Category | Count | Rule ID | Severity Assessment |
|----------|-------|---------|---------------------|
| errcheck | 12 | — | MEDIUM — errors silently discarded |
| staticcheck QF1012 | 3 | QF1012 | LOW — inefficiency, not a bug |
| staticcheck S1039 | 1 | S1039 | LOW — dead simplification |

### Detailed Findings

#### errcheck (12 issues) — MEDIUM

`errcheck` detects call sites where the returned `error` value is ignored without explicit assignment
or a blank identifier (`_`). In Go, unchecked error returns are a common source of silent failures:
I/O operations (file writes, network sends) can fail without the caller ever knowing.

**Affected locations (from `golangci_backend.json`):**
- Test files (`new_tests/backend/flow_test.go`) — all 12 occurrences are in this file

**Severity rationale:**
- Test-file errcheck: LOW practical risk — test failures are self-evident; discarding errors in test multipart construction is common Go practice
- No errcheck finding in production code (`internal/merge/`, `internal/encryption/`, or any other production package)
- No errcheck finding in authentication, JWT handling, or database operations (those are covered by auth-ms's own error handling)

**Recommendation:** Apply `//nolint:errcheck` with a justification comment to the test-file instances — discarding errors in multipart test construction is an acceptable pattern as test failures are self-evident.

#### staticcheck QF1012 (3 issues) — LOW

`QF1012` flags uses of `io.WriteString(w, fmt.Sprintf(...))` that can be replaced with the
equivalent `fmt.Fprintf(w, ...)`. The latter avoids an intermediate string allocation.

**Affected locations:**
- `internal/encryption/encrypt.go`
- `internal/merge/merger.go`
- `internal/merge/split.go`

**Severity rationale:** These are refactoring hints, not bugs. The current code is functionally correct.
The replacement improves minor performance (one fewer string allocation per call) and readability.
In a PDF processing context where these functions may be called in hot paths, the optimization is
worth applying, but carries zero functional risk if deferred.

**Recommendation:** Apply the suggested refactor in a cleanup pass. Each fix is a single-line change.

#### staticcheck S1039 (1 issue) — LOW

`S1039` flags an unnecessary call to `fmt.Sprintf` where the format string contains no format
directives — i.e., `fmt.Sprintf("some literal")` should just be `"some literal"`.

**Affected location:**
- `test/integration_test.go`

**Severity rationale:** No functional impact. This is a dead-code simplification in a test file.

**Recommendation:** Replace `fmt.Sprintf("literal")` with the string literal directly. Trivial one-line fix.

### Threshold Assessment

| Metric | Value | Interpretation |
|--------|-------|----------------|
| Total issues | 16 | Low density for a codebase of this scope |
| Issues in production code | 3 (QF1012 only) | Low — style refactoring, not correctness bugs |
| Issues in test code | 13 (12 errcheck + 1 S1039) | Low risk — test failures are observable |
| Security-relevant issues | 0 | No security findings from golangci-lint |
| Blocking issues | 0 | No build failures or critical correctness bugs |

Go has no direct Cyclomatic Complexity (CC) or Maintainability Index (MI) equivalent in the standard
golangci-lint configuration — those metrics apply to the SUT's Python/JS code. For Go, golangci-lint
provides both style (staticcheck) and correctness (errcheck, govet) signals in a single pass.

**Overall assessment:** The backend is in excellent shape. All 12 errcheck violations are confined
to test files (`new_tests/backend/flow_test.go`) — there are no production-path unchecked error
returns. The highest-priority finding is the three QF1012 style hints in production files, which
are low-effort refactors. No finding indicates a security vulnerability or a correctness bug that
would affect the PDF generation pipeline.

---

## 2. ESLint — React Frontend

### Tool Configuration

- **Tool:** ESLint 8.55.0 (binary: `frontend/node_modules/.bin/eslint` — already installed)
- **Config file:** `frontend/.eslintrc.cjs` (CommonJS config — required because `package.json` sets `"type": "module"`)
- **Plugins:** `eslint-plugin-react` v7.33.2, `eslint-plugin-react-hooks` v4.6.0, `eslint-plugin-react-refresh`
- **Command:** `node_modules/.bin/eslint . --ext js,jsx --format json --output-file ../reports/eslint_frontend.json --report-unused-disable-directives --max-warnings 0`
- **Scope:** `gopdfsuit-qua/frontend/` — all `.js` and `.jsx` files (53 files)
- **Report file:** `gopdfsuit-qua/reports/eslint_frontend.json`

### Findings Summary

| Metric | Value |
|--------|-------|
| Files analyzed | 53 |
| Errors | 0 |
| Warnings | 0 |
| Status | CLEAN — all files pass configured rules |

### Interpretation

The React frontend passes ESLint with zero findings under all configured rules. This is a meaningful
result because the configuration covers several categories of real React quality issues:

**Rules enforced by `eslint-plugin-react`:**
- `react/prop-types`: **disabled** (`off`) — component props are not type-validated by ESLint
- JSX runtime mode enabled (`react/react-in-jsx-scope: off`) — React 17+ automatic JSX transform
- Other react best-practice rules active (component display names, key props in lists, etc.)

**Rules enforced by `eslint-plugin-react-hooks`:**
- `react-hooks/rules-of-hooks`: error — hooks cannot be called conditionally or outside components
- `react-hooks/exhaustive-deps`: warn — dependency arrays must include all referenced variables

**Rules enforced by `eslint-plugin-react-refresh`:**
- `react-refresh/only-export-components`: warn — Vite HMR compatibility (only components are exported from component files)

A zero-finding result is consistent with a well-maintained frontend that has been actively linted
during development. The team's use of Vite (which integrates ESLint via the dev server) encourages
continuous lint compliance.

**What ESLint does NOT cover:**

| Gap | Risk | Recommendation |
|-----|------|----------------|
| `react/prop-types: off` | Component props are untyped — runtime shape mismatches go undetected | Enable prop-types or migrate to TypeScript |
| No `browserslist` in package.json | No cross-browser compatibility targeting | Add browserslist if IE11/legacy support required |
| No `@typescript-eslint` rules | TypeScript-specific patterns not enforced | Add if migrating to TypeScript |
| No `eslint-plugin-security` | JavaScript security patterns not scanned | Consider adding for XSS/injection checks on user-controlled data |

### Threshold Assessment

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| Errors | 0 | 0 (hard limit: `--max-warnings 0`) | PASS |
| Warnings | 0 | 0 (hard limit: `--max-warnings 0`) | PASS |
| Files covered | 53 | All .js and .jsx in frontend/ | COMPLETE |

**Overall assessment:** The frontend is in excellent shape under the configured ruleset. The zero-finding
result is a genuine quality signal — the active hooks rules and react-refresh rules are non-trivial,
and passing all 53 files cleanly demonstrates consistent coding discipline. The primary gap is the
absence of prop-types validation, which shifts type-safety responsibility entirely to the developer.

---

## 3. Cross-Tool Comparison

| Dimension | Go Backend (golangci-lint) | React Frontend (ESLint) |
|-----------|--------------------------|------------------------|
| Total issues | 16 | 0 |
| Error-class issues | 0 (no errors, only warnings) | 0 |
| Security findings | 0 (gosec handles security) | 0 |
| Refactoring hints | 4 (staticcheck) | 0 |
| Correctness gaps | 12 (errcheck) | 0 |
| Overall status | Acceptable — targeted cleanup needed | Clean |

The Go backend's 16 findings are concentrated in a small set of patterns (errcheck + two staticcheck
rules) and are all actionable without architectural changes. The React frontend's clean result
means no lint work is required before the project's current release scope.

**Recommended priority order for remediation:**
1. Apply QF1012 refactors in production files (3 issues — one-line changes each, LOW risk)
2. Evaluate prop-types enablement in frontend (configuration change, cross-cutting)
3. Annotate test-file errcheck with `//nolint:errcheck` (12 issues in `new_tests/`, documentation only)
4. Fix S1039 in `test/integration_test.go` (1 issue, trivial)
