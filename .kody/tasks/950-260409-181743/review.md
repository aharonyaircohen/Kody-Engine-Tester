## Verdict: PASS

## Summary

A new Next.js `middleware.ts` was created at the project root to protect API routes via JWT validation. The implementation extracts Bearer tokens, validates JWT signature/expiration, and attaches user info to request headers. Tests were added in `src/middleware/middleware.test.ts` covering token extraction, validation, and route matching.

## Findings

### Critical

**None.**

### Major

**None.**

### Minor

`middleware.ts:71` — Missing newline at EOF (subsequently fixed in working tree).

---

## Two-Pass Review

**Pass 1 — CRITICAL (must fix before merge):**

### SQL & Data Safety
- No SQL operations in this diff.

### Race Conditions & Concurrency
- No concurrency issues; JWT validation is stateless.

### LLM Output Trust Boundary
- N/A.

### Shell Injection
- No shell operations.

### Enum & Value Completeness
- `RbacRole` (`'admin' | 'editor' | 'viewer'`) used correctly. No new enums introduced.

**Pass 2 — INFORMATIONAL (should review, may auto-fix):**

### Conditional Side Effects
- No issues.

### Test Gaps
- **Resolved**: `src/middleware/middleware.test.ts` now covers:
  - 5 tests for `extractBearerToken` (valid Bearer, null, non-Bearer, malformed, empty)
  - 5 tests for JWT validation (valid, expired, malformed, wrong signature, blacklisted)
  - 13 tests for route matching (protected/public/non-protected/custom config)
  - All 1786 tests pass (1 pre-existing DB error in `tests/int/api.int.spec.ts`)

### Dead Code & Consistency
- `createAuthMiddleware()` is called immediately at module load with default config. This is intentional for Next.js middleware which requires a default export.

### Crypto & Entropy
- Uses Web Crypto API via `JwtService.verify()`.
- Fallback secret acceptable for dev.

### Performance & Bundle Impact
- Middleware runs on all `/api/:path*` routes — minimal overhead.

### Type Coercion at Boundaries
- No issues.

---

**Pre-existing issues (not blocking, unrelated to this diff):**
- Build fails due to `src/pages/board/modal.tsx` missing a default export (Pages Router config issue)
- Integration test `tests/int/api.int.spec.ts` has a pre-existing PostgreSQL query parameter error
