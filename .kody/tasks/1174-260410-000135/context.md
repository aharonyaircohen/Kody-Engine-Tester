
### taskify (2026-04-10T00:04:57)
{
  "task_type": "feature",
  "title": "Add /login and /register HTTP endpoints",
  "description": "Create Next.js route handlers at src/app/api/auth/login/route.ts and src/app/api/auth/register/route.ts that expose the existing register/login business logic as HTTP POST endpoints. The register endpoint should accept email, password, and confirmPassword; the login endpoint should accept email and password. Both should return JWT tokens on success with appropriate HTTP status codes (201 for regis
...(truncated)

### plan (2026-04-10T00:05:18)
## Existing Patterns Found

- `src/app/api/enroll/route.ts` — Next.js App Router POST handler pattern: `export const POST = withAuth(async (request: NextRequest, { user }) => { ... }, { roles: [...] })`
- `src/app/api/health/route.ts` — Simple GET handler returning `new Response(JSON.stringify(...), { status: 200, headers: { 'Content-Type': 'application/json' } })`
- `src/api/auth/register.ts` — Existing register function with email/password validation, duplicate check, and strength validation
-
...(truncated)

### build (2026-04-10T00:09:53)
My implementation follows the same patterns as the existing route handlers. The implementation is complete.

## Summary

Created two new route handlers:

**`src/app/api/auth/register/route.ts`** (POST `/register`)
- Accepts `email`, `password`, `confirmPassword` in JSON body
- Returns 201 with JWT tokens on success
- Returns 400 for validation errors (weak password, passwords don't match, invalid email)
- Returns 409 for duplicate email

**`src/app/api/auth/login/route.ts`** (POST `/login`)
- Ac
...(truncated)
