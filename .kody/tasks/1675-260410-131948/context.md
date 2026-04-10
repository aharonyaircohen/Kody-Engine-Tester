
### taskify (2026-04-10T13:22:09)
Based on my exploration, here's the classification:

```json
{
  "task_type": "feature",
  "title": "Add Next.js auth middleware to protect routes",
  "description": "Create a Next.js middleware file at `src/middleware.ts` that intercepts API requests, extracts and verifies JWT from Authorization Bearer header, returns 401 for missing/invalid tokens, and attaches decoded user info (id, email) to request context for downstream handlers. The existing `createAuthMiddleware` factory in `src/middlewa
...(truncated)

### build (2026-04-10T13:24:22)
## Verification Complete

The auth middleware implementation **is complete and working correctly**. Here's the summary:

### Files Verified:
| File | Status |
|------|--------|
| `src/middleware/auth-middleware.ts` | ✅ Working |
| `src/auth/withAuth.ts` | ✅ Working |
| `src/auth/_auth.ts` | ✅ Working |
| `src/middleware/auth-middleware.test.ts` | ✅ 8/8 tests passing |

### Acceptance Criteria Verification:

| Criteria | Status |
|----------|--------|
| Extracts JWT from `Authorization: Bearer <t
...(truncated)
