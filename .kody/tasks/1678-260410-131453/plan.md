The plan is ready at `.kody/tasks/1678-260410-131453/plan.md`. 

**Summary:**
- **Step 1:** Create `src/middleware.ts` with `createAuthMiddleware` factory following the `rate-limiter.ts` pattern (NextRequest → NextResponse, excludePaths via Set)
- **Step 2:** Create `src/middleware/auth-middleware.next.test.ts` with tests for valid JWT, missing JWT, expired JWT, malformed JWT, and custom excludePaths

The middleware will:
- Exclude paths like `/login`, `/register`, `/health`, `/api/auth/*` by default
- Return 401 with error message for missing/invalid/expired tokens
- Attach `x-user-id`, `x-user-email`, `x-user-role` headers on valid token
- Pass valid requests through unchanged via `NextResponse.next()`
