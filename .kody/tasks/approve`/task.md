# Create HTTP endpoints for /api/auth/login and /api/auth/register

## Context
The `src/api/auth/login.ts` and `src/api/auth/register.ts` files export utility functions but are not exposed as HTTP endpoints. No `src/app/api/auth/` route handlers exist. These endpoints are needed for clients to actually authenticate. The login endpoint must use AuthService (Payload-based PBKDF2), not UserStore, to maintain consistency with the JWT auth architecture.

## Acceptance Criteria
- `POST /api/auth/login` accepts `{ email, password }` and returns `{ accessToken, refreshToken, user }`
- `POST /api/auth/register` accepts `{ email, password, confirmPassword }` and returns `{ accessToken, refreshToken, user }`
- Both endpoints return appropriate HTTP status codes (400 for validation errors, 401 for invalid credentials, 409 for email conflicts)
- Both endpoints use AuthService, not UserStore
- Rate limiting is applied to prevent brute force attacks

## Test Strategy
- Integration test: POST /api/auth/register with valid input returns 200 with tokens
- Integration test: POST /api/auth/register with existing email returns 409
- Integration test: POST /api/auth/login with valid credentials returns 200 with tokens
- Integration test: POST /api/auth/login with invalid password returns 401
- Integration test: POST /api/auth/login with non-existent email returns 401
- Integration test: password strength validation on register

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-18):
@kody

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `2792-260418-164944`

**@aharonyaircohen** (2026-04-18):
🏗️ **Kody has architecture questions:**

1. None — all architectural decisions are covered by existing patterns. The task description is clear on using `AuthService` (PBKDF2) for login, and the register route reuses the existing `src/api/auth/register.ts` utilities exactly as designed.

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `approve``

