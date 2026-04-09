
### taskify (2026-04-09T22:48:00)
```json
{
  "task_type": "feature",
  "title": "Add /login and /register HTTP route handlers",
  "description": "Create Next.js route handlers in src/app/api/auth/login/route.ts and src/app/api/auth/register/route.ts that expose the existing login/register business logic as POST HTTP endpoints. The business logic already exists in src/api/auth/login.ts and src/api/auth/register.ts with tests. Route handlers should: POST /register accepts email/password/confirmPassword, returns JWT (201), validat
...(truncated)

### plan (2026-04-09T22:49:34)
## Implementation Plan

### Pattern Discovery Report

- **Route handler pattern**: `src/app/api/enroll/route.ts` and `src/app/api/health/route.ts` show how to create Next.js route handlers that return JSON Response objects
- **Auth dependencies**: `src/auth/index.ts` exports module-level singletons (`userStore`, `sessionStore`, `jwtService`) and AuthService for Payload-based auth
- **Business logic**: `src/api/auth/login.ts` and `src/api/auth/register.ts` contain the login/register logic already
...(truncated)

### build (2026-04-09T22:54:29)
Implementation complete. Here's a summary:

**Created files:**

1. `src/app/api/auth/login/route.ts` - POST login endpoint
   - Accepts `email`/`password`
   - Returns 200 with JWT tokens on success, 401 for invalid credentials, 400 for validation errors

2. `src/app/api/auth/register/route.ts` - POST register endpoint
   - Accepts `email`/`password`/`confirmPassword`
   - Returns 201 with JWT tokens on success, 409 for duplicate email, 400 for validation errors

3. `src/app/api/auth/login/route
...(truncated)

### review (2026-04-09T22:59:01)
## Verdict: PASS

## Summary

Added two Next.js route handlers — `POST /api/auth/login` and `POST /api/auth/register` — exposing existing business logic as HTTP endpoints. Both handlers follow established patterns from `src/app/api/enroll/route.ts` and `src/app/api/health/route.ts`. All 13 route-level tests pass.

## Findings

### Critical

None.

### Major

`src/app/api/auth/register/route.ts:17-18` — Register route creates its own `JwtService` and `AuthService` instances instead of using the m
...(truncated)
