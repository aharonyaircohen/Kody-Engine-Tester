# Create /login and /register API endpoints

## Context
The codebase has an existing `AuthService` with JWT-based login logic, but there are no Next.js route handlers exposing `/login` or `/register` endpoints. The Payload Users collection with `auth: true` already provides password hashing via hash/salt fields. This task creates the public-facing API routes that clients will call to authenticate.

## Acceptance Criteria
- `POST /api/auth/login` accepts `{ email, password }` and returns `{ accessToken, refreshToken, user }` on success
- `POST /api/auth/register` accepts `{ email, password, firstName, lastName }` and creates a new user via Payload
- Registration hashes the password using Payload's built-in password hashing (same algorithm used by AuthService)
- Login uses existing `AuthService.login()` method
- Both endpoints return appropriate HTTP status codes (400 for validation errors, 401 for invalid credentials, 201 for registration success)
- Both endpoints sanitize inputs before processing
- Refresh token is stored on the user document in Payload (as expected by `AuthService.refresh()`)

## Test Strategy
- Write integration tests for `/api/auth/login` and `/api/auth/register` in `tests/int/auth/`
- Test successful login returns tokens and user data
- Test login with invalid credentials returns 401
- Test registration with missing fields returns 400
- Test registration with existing email returns appropriate error
- Test that newly registered users can subsequently login


---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-18):
@kody

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `2504-260418-035526`

