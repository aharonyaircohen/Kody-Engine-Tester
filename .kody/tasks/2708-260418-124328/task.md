# Create /register route handler

## Context
The codebase has `src/api/auth/register.ts` as a utility function that creates users via Payload and then calls `AuthService.login`. This task creates the Next.js route handler at `src/app/api/auth/register/route.ts`.

## Acceptance Criteria
- `POST /api/auth/register` route handler exists at `src/app/api/auth/register/route.ts`
- Accepts `email`, `password`, `confirmPassword` in request body JSON
- Validates email format, password strength (8+ chars, uppercase, number, special char), and matching passwords
- Creates user via Payload using `authService.register()` (or direct Payload create + login)
- Returns `{ accessToken, refreshToken, user }` on success
- Returns 409 if email already exists, 400 for validation failures
- Uses existing password validation from `src/api/auth/register.ts`

## Test Strategy
- Unit test: mock Payload create and verify input validation
- Integration test: POST new user credentials and verify token response
- Integration test: POST duplicate email and verify 409 response
- Integration test: POST weak password and verify 400 response

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-18):
@kody

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `2708-260418-124328`

