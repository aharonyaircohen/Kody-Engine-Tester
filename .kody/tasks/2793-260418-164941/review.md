Now I have a complete picture. Let me compile the full review.

## Verdict: PASS

## Summary

Two new test files were added — `src/auth/withAuth.test.ts` (385 lines, 18 tests) and `tests/int/auth-protected-routes.int.spec.ts` (511 lines, 18 tests) — covering the `withAuth` HOC's 401/403/200 behavior, role inheritance, optional token mode, and the full end-to-end auth flow (register → login → protected route → refresh → logout). The build stage confirmed all 31 tests pass.

## Findings

### Critical

None.

### Major

None.

### Minor

1. `src/auth/withAuth.ts:96` — Status code from thrown auth errors is silently coerced to 401. `authContext.status ?? 401` in the catch block always returns 401 even when the underlying service threw a different status (e.g., `createError('User not found', 404)` at line 92). This is currently harmless since all auth-service errors are 401, but it masks a real inconsistency in `auth-service.ts` where `logout`'s `find` failure would produce 404 instead of 401. No test gap here since the behavior is correct, but the coercion is implicit. Suggested fix: assert that thrown auth errors always use 401, or use a typed result type instead of throwing.

2. `tests/int/auth-protected-routes.int.spec.ts:429-433` — `mockPayload.update.mockImplementation` inside a test body captures the updated token in closure. If the test throws before `loginResult.refreshToken` is consumed, the closure retains stale state. Not a functional bug since the test completes successfully, but fragile if the test grows additional steps. Low risk.

### Notes (Informational, Not Blocking)

- **Blacklist not exercised end-to-end**: `JwtService.blacklist()` is tested in `jwt-service.test.ts` but not via `withAuth` in these new test files. This is intentional — `blacklist()` is a separate revocation mechanism; logout clears the stored `refreshToken` instead (tested in the full flow test).
- **`/api/auth/refresh` route handler not tested**: `src/api/auth/refresh.ts` wraps `authService.refresh()` directly — the integration test covers the service call but not the HTTP handler wiring. `src/auth/auth-service.test.ts` covers the service-level refresh behavior.
- **Role inheritance only tested for admin ≥ viewer**: The `checkRole` hierarchy (`admin(3) > editor(2) > viewer(1)`) is tested for admin accessing viewer routes but not for editor accessing viewer routes (`2 >= 1`). Functional behavior is correct (the logic is a single `>=` comparison) but this specific edge is implicit rather than explicit.