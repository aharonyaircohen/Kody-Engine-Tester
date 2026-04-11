
### taskify (2026-04-11T16:35:28)
{
  "task_type": "feature",
  "title": "Add /login and /register HTTP endpoints",
  "description": "Create POST /register and POST /login HTTP route handlers that expose the existing auth business logic as REST endpoints. The existing register() and login() functions in src/api/auth/ are already implemented but lack Next.js route handlers. New routes should follow the existing pattern in src/app/api/*/route.ts using NextRequest/NextResponse and getPayloadInstance().",
  "scope": [
    "src/app/a
...(truncated)

### plan (2026-04-11T16:36:14)
Now I have a clear picture. Let me write the plan.

---

## Existing Patterns Found

- **Route handler pattern**: `src/app/api/notes/route.ts` shows the canonical Next.js App Router pattern — `export const GET/POST` functions receiving `NextRequest`, returning `Response` with JSON, using `getPayloadInstance()` for Payload access
- **Business logic layer**: `src/api/auth/register.ts` and `src/api/auth/login.ts` contain the auth business logic that the route handlers should delegate to
- **AuthSer
...(truncated)

### build (2026-04-11T16:45:22)
All tasks completed. Here's a summary of the changes:

## Summary

### New Files Created:
1. **`src/app/api/auth/login/route.ts`** - POST /login route handler that:
   - Accepts email/password in JSON body
   - Uses AuthService.login() to validate credentials
   - Returns 200 with tokens on success, 401 on invalid credentials, 400 on missing fields

2. **`src/app/api/auth/register/route.ts`** - POST /register route handler that:
   - Accepts email, password, confirmPassword, firstName, lastName 
...(truncated)
