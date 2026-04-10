
### taskify (2026-04-10T07:57:17)
Based on my exploration, the logic functions exist in `src/api/auth/` but the actual Next.js route handlers at `src/app/api/auth/login/route.ts` and `src/app/api/auth/register/route.ts` are missing.

```json
{
  "task_type": "feature",
  "title": "Add login and register JWT route handlers",
  "description": "Create Next.js API route handlers for POST /login and POST /register endpoints. The logic functions already exist in src/api/auth/. Need to create route handlers that: parse request body (em
...(truncated)

### plan (2026-04-10T07:58:28)
## Existing Patterns Found

- **Next.js route handlers**: `src/app/api/courses/search/route.ts` - GET handler with `NextRequest`, returns `Response` with JSON
- **Auth module singletons**: `src/auth/index.ts` exports `userStore`, `sessionStore`, `jwtService`
- **Payload singleton**: `src/services/progress.ts` shows `getPayloadInstance()` pattern
- **Error throwing with status**: `src/api/auth/register.ts` throws `{ message, status }` errors

## Steps

### Step 1: Create login route handler

**Fi
...(truncated)

### build (2026-04-10T08:01:38)
Implementation complete. Here's a summary:

**Created files:**

1. **`src/app/api/auth/login/route.ts`** - POST handler that:
   - Validates email/password required fields (400)
   - Extracts IP address and user agent from headers
   - Calls `login()` from `@/api/auth/login`
   - Returns JWT tokens (200) or error with status code (401, 403, 423)

2. **`src/app/api/auth/register/route.ts`** - POST handler that:
   - Validates email, password, confirmPassword required fields (400)
   - Extracts IP
...(truncated)
