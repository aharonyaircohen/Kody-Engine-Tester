# Add /login and /register API endpoints

## Context
JWT authentication requires `/login` and `/register` endpoints. The codebase already has implementations at `src/api/auth/login.ts` and `src/api/auth/register.ts` but they use different auth backends (UserStore vs AuthService). This task consolidates them to use a single auth backend based on the Payload Users collection with JWT token generation.

## Acceptance Criteria
- `POST /api/auth/register` creates a new user in Payload Users collection and returns JWT access/refresh tokens
- `POST /api/auth/login` validates credentials against Payload Users collection and returns JWT access/refresh tokens
- Endpoints use `AuthService` (PBKDF2 password verification) and `JwtService` for token generation
- Password validation includes strength requirements (8+ chars, uppercase, number, special char)
- Endpoints return appropriate HTTP status codes (400 for validation, 401 for invalid creds, 409 for conflict)
- Endpoints are accessible from `src/app/api/auth/login/route.ts` and `src/app/api/auth/register/route.ts`

## Test Strategy
- Unit test `login` function with valid/invalid credentials
- Unit test `register` function with valid/invalid input
- Integration test HTTP endpoints with Playwright or vitest supertest
- Verify token is valid and can be used with `withAuth`

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-18):
@kody

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `2496-260418-035352`

