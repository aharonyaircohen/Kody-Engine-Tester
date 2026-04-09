
### taskify (2026-04-09T18:14:45)
```json
{
  "task_type": "feature",
  "title": "Add /login and /register HTTP endpoints",
  "description": "Create Next.js route handlers for POST /register and POST /login that expose existing business logic from src/api/auth/. The register endpoint should accept email/password, create user via Payload, validate passwords, return 409 on duplicate email, and return JWT tokens. The login endpoint should validate credentials via UserStore, return JWT tokens on success, and handle errors (400/401/4
...(truncated)

### plan (2026-04-09T18:15:30)
Now I have a complete picture. Let me write the plan.

## Existing Patterns Found

- **Route handler pattern** (`src/app/api/notifications/route.ts`): Next.js route handlers use `NextRequest`, return `Response` with JSON, use `getPayloadInstance()` for Payload, and follow error-first patterns
- **Auth business logic** (`src/api/auth/login.ts`, `src/api/auth/register.ts`): Already have `login()` and `register()` functions that handle the core logic
- **AuthService** (`src/auth/auth-service.ts`): 
...(truncated)

### build (2026-04-09T18:21:43)
## Implementation Complete

I've successfully implemented the login and register HTTP endpoints:

### Files Created

**Route Handlers:**
- `src/app/api/auth/register/route.ts` - POST /register endpoint
- `src/app/api/auth/login/route.ts` - POST /login endpoint

**Tests:**
- `src/app/api/auth/register/route.test.ts` - 6 tests for register
- `src/app/api/auth/login/route.test.ts` - 6 tests for login

### Summary

**POST /register** (`src/app/api/auth/register/route.ts:1`):
- Accepts `email`, `pass
...(truncated)
