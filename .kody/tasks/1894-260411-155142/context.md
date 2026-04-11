
### taskify (2026-04-11T15:54:04)
{
  "task_type": "feature",
  "title": "Add integration tests for protected routes",
  "description": "The auth middleware and unit tests exist at src/middleware/auth-middleware.ts and auth-middleware.test.ts. The withAuth HOC at src/auth/withAuth.ts is already applied to 13+ API routes. However, the integration tests from the task's test strategy are missing: (1) protected route rejects unauthenticated request with 401, (2) protected route accepts authenticated request and returns data. These r
...(truncated)

### build (2026-04-11T16:00:07)
All 5 tests pass. Here's a summary of the integration tests I created:

**File created:** `tests/int/protected-routes.int.spec.ts`

**Tests implemented:**
1. `returns 401 when no token provided to protected route` - Tests that a GET request without auth header returns 401
2. `returns 401 for invalid token on protected route` - Tests that a request with `Bearer invalid-token` returns 401
3. `returns 401 for expired token on protected route` - Tests that a request with `Bearer expired-token` retur
...(truncated)
