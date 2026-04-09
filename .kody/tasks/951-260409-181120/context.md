
### taskify (2026-04-09T18:14:41)
```json
{
  "task_type": "feature",
  "title": "Add /login and /register API endpoints",
  "description": "Create POST route handlers for /login and /register in src/app/api/auth/. The login handler should accept {email, password}, call the existing login logic from src/api/auth/login.ts, and return JWT tokens. The register handler should accept {email, password, confirmPassword}, call existing register logic from src/api/auth/register.ts, create a user, and return JWT tokens. Both should return
...(truncated)

### plan (2026-04-09T18:15:32)
## Existing Patterns Found

- `src/app/api/enroll/route.ts` — POST handler with `NextRequest`, auth via `withAuth`, Payload via `getPayloadInstance`, returns `Response` with JSON
- `src/app/api/health/route.ts` — Simple route handler pattern with `NextRequest` and `Response`
- `src/api/auth/login.ts` — Existing login logic using `UserStore`, `SessionStore`, `JwtService` with proper error handling (400/401/403/423)
- `src/api/auth/register.ts` — Existing register logic using `AuthService` with va
...(truncated)

### build (2026-04-09T18:22:20)
## Implementation Complete

I've implemented the `/login` and `/register` API endpoints following the plan:

### Created Files

**1. `src/app/api/auth/login/route.ts`** - POST login endpoint
- Accepts `{ email, password }` from request body
- Uses existing `login` function from `@/api/auth/login` with in-memory `UserStore`, `SessionStore`, and `JwtService`
- Returns 400 for missing fields, 401 for invalid credentials, 200 with JWT tokens on success

**2. `src/app/api/auth/register/route.ts`** - 
...(truncated)
