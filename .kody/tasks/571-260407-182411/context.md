
### taskify (2026-04-07T18:26:00)
```json
{
  "task_type": "feature",
  "title": "Add /login and /register HTTP endpoints",
  "description": "Create POST /register and POST /login HTTP route handlers in src/app/api/auth/. The endpoints should handle user registration with email/password and login with credential validation, returning JWT tokens. Register should follow existing register.ts business logic with password strength validation (8+ chars, uppercase, number, special char). Login should use AuthService which verifies pass
...(truncated)

### plan (2026-04-07T18:26:40)

## Existing Patterns Found

- `src/app/api/health/route.ts` - Basic GET route handler using `NextRequest`/`Response` with JSON headers
- `src/app/api/enroll/route.ts` - POST handler using `getPayloadInstance` from `@/services/progress`, returns `Response` with proper status codes
- `src/api/auth/register.ts` - Business logic for registration: email validation, password strength check (8+ chars, uppercase, number, special char), checks for duplicate email via Payload, creates user with `role: 'v
...(truncated)

### build (2026-04-07T18:38:34)
Implementation complete. Here's a summary:

## Created Files

**1. `src/app/api/auth/login/route.ts`** - POST `/api/auth/login`
- Accepts `{ email, password }` JSON body
- Returns 400 if fields missing
- Returns 401 for invalid credentials  
- Returns 200 with JWT tokens on success (using AuthService with PBKDF2 password verification)

**2. `src/app/api/auth/register/route.ts`** - POST `/api/auth/register`
- Accepts `{ email, password, confirmPassword }` JSON body
- Returns 400 for validation fa
...(truncated)

### review (2026-04-07T18:44:32)
## Verdict: FAIL

## Summary

The implementation creates POST `/api/auth/login` and `/api/auth/register` endpoints, but has a **critical bug**: the `register()` function creates users without required `firstName` and `lastName` fields that the Users collection mandates (`required: true`). Tests pass because they mock `payload.create` without validating the data structure. Additionally, the acceptance criteria states `POST /register accepts { email, password }` but the implementation requires `{ 
...(truncated)

### review-fix (2026-04-07T18:46:41)
All tests pass. Here's a summary of the fixes:

## Major Issues Fixed

**Major #1** (`src/api/auth/register.ts`): User creation now includes `firstName` and `lastName` derived from email:
- `john.doe@example.com` → `firstName: "john"`, `lastName: "doe"`
- `jane@example.com` → `firstName: "jane"`, `lastName: ""`

**Major #2** (`src/app/api/auth/register/route.ts`): Route handler now accepts `{ email, password }` per acceptance criteria instead of `{ email, password, confirmPassword }`. The route 
...(truncated)

### review (2026-04-07T18:47:50)
## Verdict: PASS

## Summary

The implementation creates POST `/api/auth/login` and `/api/auth/register` endpoints. The previous major issues (missing firstName/lastName fields and confirmPassword requirement) have been addressed. Tests pass (13/13), TypeScript compiles cleanly, and ESLint reports no issues.

## Findings

### Critical

**None.**

### Major

**None.**

### Minor

- `src/app/api/auth/register/route.ts:43` — Comment `// confirmPassword = password (no confirmation required per accep
...(truncated)
