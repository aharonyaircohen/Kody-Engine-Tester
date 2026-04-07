
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
