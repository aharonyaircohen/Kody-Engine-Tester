
### taskify (2026-04-07T18:28:41)
```json
{
  "task_type": "feature",
  "title": "Add role-based access control middleware",
  "description": "Create reusable RBAC middleware in `src/middleware/rbac.ts` that extracts JWT from Authorization header using existing `JwtService`, validates the user's role, and returns 403 if unauthorized. Support OR logic for multiple allowed roles. Add integration tests covering valid role, invalid role, missing token, and expired token scenarios. Update gradebook endpoint to use the new middleware.
...(truncated)

### plan (2026-04-07T18:31:20)
Now I have a complete picture. Let me write the plan.

## Existing Patterns Found

- **`src/middleware/rate-limiter.ts`**: Factory pattern that returns a `(request: NextRequest) => NextResponse` middleware function — the exact `NextMiddleware` signature the task requires
- **`src/auth/_auth.ts`**: `extractBearerToken` helper and `checkRole` function for JWT extraction and role validation
- **`src/auth/jwt-service.ts`**: JWT signing and verification with `signAccessToken` / `verify` methods
- **`
...(truncated)

### build (2026-04-07T18:41:18)
Implementation complete. Here's what was delivered:

**Step 1: `src/middleware/rbac.ts`** — New file with `requireRole(...roles: RbacRole[]): NextMiddleware` factory:
- Uses `JwtService` singleton for token verification
- Hierarchical role checking (`admin > editor > viewer`) via `ROLE_HIERARCHY`
- Returns 401 for missing/invalid/expired tokens, 403 for insufficient roles
- Attaches `x-user-id` and `x-user-role` headers on success for downstream handlers

**Step 2: `tests/int/rbac.int.spec.ts`**
...(truncated)

### review (2026-04-07T18:46:11)
## Verdict: PASS

## Summary

The RBAC middleware implementation is functionally correct. It properly extracts JWT from the Authorization header using existing `JwtService`, performs hierarchical role checks (`admin > editor > viewer`), and returns appropriate HTTP status codes (401 for auth failures, 403 for insufficient roles). The gradebook route was successfully migrated from `withAuth` HOC to `requireRole` middleware, with user context passed via `x-user-id`/`x-user-role` headers. Integrati
...(truncated)
