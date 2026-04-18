# Add login and register route handlers

## Context
The existing codebase has auth infrastructure: `AuthService` in `src/auth/auth-service.ts` with `login()`, `refresh()`, and `verifyAccessToken()` methods, and service functions in `src/api/auth/login.ts` and `src/api/auth/register.ts`. However, there are no Next.js route handlers (`src/app/api/auth/login/route.ts` etc.) to expose these as HTTP endpoints.

This task creates the missing `/api/auth/login` and `/api/auth/register` route handlers that invoke the existing auth services.

## Acceptance Criteria
- `POST /api/auth/login` accepts `{ email, password }` and returns `{ accessToken, refreshToken, user }`
- `POST /api/auth/register` accepts `{ email, password, confirmPassword }` and returns `{ accessToken, refreshToken, user }`
- Both endpoints return appropriate HTTP status codes (400 for validation errors, 401 for invalid credentials, 409 for conflicts)
- Password strength validation is enforced on register (min 8 chars, uppercase, number, special char)
- Route handlers delegate to existing `AuthService.login()` and the `register()` function in `src/api/auth/register.ts`
- Both routes are properly typed with `NextRequest`/`Response`

## Test Strategy
- Unit tests for route handler responses to invalid input (400, 401, 409 cases)
- Integration tests calling the actual endpoints with Playwright
- Manual: `curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"wrong"}'`

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-18):
@kody

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `2635-260418-095557`

