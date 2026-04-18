# Add /login and /register HTTP endpoints

## Context
The codebase has JWT authentication infrastructure: `AuthService.login()` method, `JwtService`, and `withAuth` HOC. However, there are no HTTP endpoints exposing login and registration. Users cannot authenticate via API calls.

## Acceptance Criteria
- POST /api/login accepts `{ email, password }` and returns `{ accessToken, refreshToken, user }`
- POST /api/register accepts `{ email, password, firstName, lastName }` and creates a user via Payload
- Both endpoints return appropriate error responses (400 for validation, 401 for invalid credentials, 409 for conflict)
- Login uses existing `AuthService.login()` which verifies password against Payload's stored hash/salt
- Register uses Payload's `payload.create({ collection: 'users', ... })` with password hashing
- Both endpoints are documented with JSDoc comments following codebase conventions

## Test Strategy
- Unit test: validate request body parsing and error responses
- Integration test: POST /api/login with valid/invalid credentials
- Integration test: POST /api/register with valid/invalid inputs
- Integration test: login flow followed by authenticated request to verify token works

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-18):
@kody

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `2592-260418-091719`

