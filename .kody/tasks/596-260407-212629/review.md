## Verdict: PASS

## Summary

The RBAC middleware implementation is functionally correct. It properly extracts JWT from the Authorization header using existing `JwtService`, performs hierarchical role checks (`admin > editor > viewer`), and returns appropriate HTTP status codes (401 for auth failures, 403 for insufficient roles). The gradebook route was successfully migrated from `withAuth` HOC to `requireRole` middleware, with user context passed via `x-user-id`/`x-user-role` headers. Integration tests cover all acceptance criteria scenarios.

## Findings

### Critical
None.

### Major
None.

### Minor

1. **`src/middleware/rbac.ts:37`** — Unsafe `as never` cast discards type information from `verify()`. If the JWT payload shape changes, no TypeScript error will surface.

   **Suggested fix:**
   ```typescript
   payload = (await getJwtService().verify(token)) as TokenPayload
   ```
   Import `TokenPayload` from `@/auth/jwt-service`.

2. **`tests/int/rbac.int.spec.ts:12`** — `jwtService` is declared and initialized in `beforeAll` but never used (dead code). Tests construct tokens manually via `createToken()`.

   **Suggested fix:** Remove the unused `jwtService` variable and `beforeAll` hook, or use `jwtService.sign()` instead of manual JWT construction.

---

## Two-Pass Review Notes

**Pass 1 (CRITICAL) — All checks passed:**
- No SQL/data operations in this diff
- No race conditions (singleton pattern is acceptable for JwtService initialization)
- No hardcoded secrets (`JWT_SECRET` defaults to a dev value if env var missing — consistent with existing pattern in `withAuth.ts:16`)
- No enum/constant additions requiring consumer tracing
- No shell injection risk

**Pass 2 (INFORMATIONAL) — Minor issues noted above.**
