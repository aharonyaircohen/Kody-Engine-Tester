
### taskify (2026-04-10T07:58:41)
Now I have a complete understanding. The auth middleware implementation exists in `src/middleware/auth-middleware.ts` with comprehensive unit tests, but there's no Next.js route middleware file to actually protect routes, and no integration tests verifying protected routes reject/accept requests.

```json
{
  "task_type": "feature",
  "title": "Add auth middleware integration tests",
  "description": "The auth middleware implementation exists in src/middleware/auth-middleware.ts with unit tests 
...(truncated)

### build (2026-04-10T08:06:58)
Implementation complete. Here's a summary:

## Created Files

### 1. `src/app/middleware.ts`
Next.js route middleware that:
- Extracts JWT from `Authorization: Bearer <token>` header
- Validates tokens and returns 401 Unauthorized for invalid/missing tokens
- Protects routes: `/api/notes`, `/api/dashboard`, `/api/gradebook`
- Allows public routes: `/api/auth/login`, `/api/auth/refresh`, `/api/health`, `/api/courses/search`
- Attaches decoded user info (`x-user-id`, `x-user-email`, `x-user-role`)
...(truncated)
