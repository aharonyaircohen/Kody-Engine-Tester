
### taskify (2026-04-07T21:28:44)

```json
{
  "task_type": "feature",
  "title": "Add /login and /register HTTP endpoints",
  "description": "Create Next.js route handlers (POST) at src/app/api/auth/register/route.ts and src/app/api/auth/login/route.ts that wire existing business logic (src/api/auth/register.ts and src/api/auth/login.ts) to HTTP endpoints. The endpoints accept JSON body with email/password, return JWT tokens, handle validation errors (400), duplicate email (409), and auth failures (401).",
  "scope": [
    "src
...(truncated)

### plan (2026-04-07T21:29:39)
Now I have all the context needed. Let me write the plan.

---

## Implementation Plan

## Existing Patterns Found

- **`src/app/api/health/route.ts`**: Next.js App Router POST endpoint pattern — parses JSON body, returns `Response` with status code and JSON headers
- **`src/app/api/enroll/route.ts`**: `getPayloadInstance()` for Payload SDK access; error handling via `try/catch` with status-coded `Response` objects
- **`src/api/auth/register.ts`**: Business logic with email validation, password 
...(truncated)

### build (2026-04-07T21:33:03)
Implementation complete. I've created two new route handlers:

**`src/app/api/auth/register/route.ts`** - POST `/register`
- Accepts `email`, `password`, `confirmPassword` in JSON body
- Calls `register()` business logic which validates passwords (min 8 chars, uppercase, number, special char) and checks for duplicate emails
- Returns 201 with JWT tokens on success, 409 on duplicate email, 400 on validation errors

**`src/app/api/auth/login/route.ts`** - POST `/login`
- Accepts `email`, `password
...(truncated)

### review (2026-04-07T21:38:35)
## Verdict: PASS

## Summary

Two new Next.js route handlers were created — `POST /api/auth/register` and `POST /api/auth/login` — wiring existing business logic to HTTP endpoints following the project's established patterns from `src/app/api/health/route.ts` and `src/app/api/enroll/route.ts`. Unit tests for both auth functions pass (17 tests combined). The build fails due to a pre-existing unrelated TypeScript error in `src/pages/board/modal`.

## Findings

### Critical

None.

### Major

None.
...(truncated)
