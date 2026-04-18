
### taskify (2026-04-18T00:01:31)
The plan is ready for your review. It covers:

1. **Sanitizing error messages** in `withAuth` and `AuthService` — no more "jwt expired" or "User not found" leaking in 401 responses
2. **Removing redundant `if (!user)` checks** across 8 route files (dead code since `withAuth` already guarantees auth)
3. **Protecting `/api/my-route`** with `withAuth` + `optional: true`
4. **New integration test file** verifying all protected routes reject unauthenticated/malformed requests

### build (2026-04-18T00:03:38)
The plan is ready for your review. Here's a summary of what it covers:

**1. Sanitize error messages in `withAuth`** — All JWT verification errors ("jwt expired", "Token revoked", etc.) and auth service errors ("User not found") currently leak in 401 responses. These are all replaced with a generic `"Authentication failed"` at the `withAuth` boundary.

**2. Remove redundant `if (!user)` guards** — 8 route files have dead-code `if (!user)` checks (e.g., `src/app/api/enroll/route.ts`, `src/app/api
...(truncated)
