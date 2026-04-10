
### taskify (2026-04-10T14:21:23)
Now I have a complete picture. Let me summarize the classification:

```json
{
  "task_type": "feature",
  "title": "Complete auth middleware implementation",
  "description": "The auth middleware factory exists in src/middleware/auth-middleware.ts with passing tests, but the implementation does not fully meet acceptance criteria: (1) attaches full User object instead of simplified {userId, email}, (2) uses custom RequestContext interface instead of Express/fastify middleware signature, (3) no p
...(truncated)

### plan (2026-04-10T14:22:10)
Now I have a clear picture. Let me write the plan.

## Existing Patterns Found

- **`src/auth/withAuth.ts`**: HOC wrapper for Next.js route handlers with JWT validation — the standard auth pattern in this codebase
- **`src/middleware/request-logger.ts`**: Next.js middleware factory using `NextRequest`/`NextResponse`
- **`src/app/api/health/route.test.ts`**: Integration test pattern — calls route handler directly with `NextRequest`
- **`src/app/api/notes/route.ts`**: Example of protected route us
...(truncated)

### build (2026-04-10T14:26:05)
Implementation complete. Here's a summary:

## Summary

**Step 1: Created integration test** (`src/app/my-route/route.test.ts`)
- Tests 401 without auth header
- Tests 401 with malformed token  
- Tests 401 with expired token
- Tests 200 with valid token and verifies user data is returned

**Step 2: Updated protected route** (`src/app/my-route/route.ts`)
- Changed from an unprotected route to use `withAuth` HOC
- Returns `{ userId, email }` from the authenticated user context

**Step 3: Verified
...(truncated)
