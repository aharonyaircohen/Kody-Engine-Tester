## Verdict: PASS

## Summary

Added two Next.js route handlers — `POST /api/auth/login` and `POST /api/auth/register` — exposing existing business logic as HTTP endpoints. Both handlers follow established patterns from `src/app/api/enroll/route.ts` and `src/app/api/health/route.ts`. All 13 route-level tests pass.

## Findings

### Critical

None.

### Major

`src/app/api/auth/register/route.ts:17-18` — Register route creates its own `JwtService` and `AuthService` instances instead of using the module-level singletons from `@/auth`. The login route correctly uses `userStore`, `sessionStore`, `jwtService` from `@/auth`. While the `JWT_SECRET` fallback is identical, this inconsistency means register tokens are signed by a different `JwtService` instance than login tokens. Recommend either:
1. Export `AuthService` as a module-level singleton from `@/auth` and use it in register route, OR
2. Pass the pre-built service instances to `register()` similar to how `login()` receives `userStore`, `sessionStore`, `jwtService`

### Minor

- `src/app/api/auth/register/route.ts:18` — `process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production'` fallback exists here and in two other places (`src/auth/index.ts:7`, `src/auth/withAuth.ts:16`). This is a pre-existing pattern, but each location extends it independently rather than sharing a single source of truth for the secret.

- No rate limiting on the login endpoint beyond in-memory `UserStore` account locking (which is lost on restart — noted in project memory as a known limitation).

- `src/app/api/auth/login/route.ts:13` — Email format not validated at route level before passing to `login()`. Empty string check is in `login()`, but malformed emails still hit the store. Minor since `login()` returns 401 and the cost is a store lookup.

## Test Results

- Login route tests: 6/6 passing (success 200, invalid credentials 401, missing email 400, missing password 400, empty body 400, unexpected error 500)
- Register route tests: 7/7 passing (success 201, duplicate email 409, weak password 400, mismatched passwords 400, invalid email 400, missing fields 400, unexpected error 500)
- TypeScript: No new errors introduced by these files (pre-existing errors in unrelated files)
