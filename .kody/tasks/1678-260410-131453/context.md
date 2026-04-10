
### taskify (2026-04-10T13:18:31)
{
  "task_type": "feature",
  "title": "Add Next.js auth middleware for route protection",
  "description": "Create a Next.js middleware file that protects routes by validating JWT tokens from the Authorization Bearer header. Must support route exclusion patterns (e.g., /login, /register) and return 401 with error message for missing/invalid tokens. Should attach decoded user payload to request context on success and pass valid requests through unchanged. Should reuse the existing JwtService fro
...(truncated)

### plan (2026-04-10T13:20:23)
The plan is ready at `.kody/tasks/1678-260410-131453/plan.md`. 

**Summary:**
- **Step 1:** Create `src/middleware.ts` with `createAuthMiddleware` factory following the `rate-limiter.ts` pattern (NextRequest → NextResponse, excludePaths via Set)
- **Step 2:** Create `src/middleware/auth-middleware.next.test.ts` with tests for valid JWT, missing JWT, expired JWT, malformed JWT, and custom excludePaths

The middleware will:
- Exclude paths like `/login`, `/register`, `/health`, `/api/auth/*` by de
...(truncated)

### build (2026-04-10T13:22:05)
Done. Created the auth middleware following the established patterns.

**Files created:**

1. **`src/middleware.ts`** — Next.js middleware factory with:
   - `createAuthMiddleware(config)` factory accepting `JwtService` and optional `excludePaths`
   - Default exclusions: `/login`, `/register`, `/health`, `/api/auth/*`
   - Wildcard support for path prefixes (e.g., `/api/auth/*`)
   - Returns `NextResponse.next()` for excluded paths
   - Returns 401 with error message for missing/invalid/expired
...(truncated)
