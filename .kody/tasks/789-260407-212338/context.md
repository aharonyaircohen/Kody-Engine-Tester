
### taskify (2026-04-07T21:54:03)
```json
{
  "task_type": "refactor",
  "title": "Refactor auth system: JWT replacing sessions, add RBAC roles array",
  "description": "Replace session-based auth with stateless JWT, migrate User schema from single `role` to `roles: RbacRole[]` array, consolidate RBAC into new src/middleware/rbac.ts, update all API auth handlers (login/logout/refresh/profile/register) to use pure JWT, and provide a migration script. Current issues: session-store.ts stores tokens server-side but JWT is already av
...(truncated)

### plan (2026-04-07T21:55:11)
Now I have a comprehensive understanding of the codebase. Let me write the plan.

## Existing Patterns Found

- **JwtService** (`src/auth/jwt-service.ts`): Stateless JWT sign/verify/blacklist — already the backbone of the new auth; `signAccessToken(15min)` and `signRefreshToken(7days)` already exist
- **AuthService** (`src/auth/auth-service.ts`): Payload-backed login/refresh/logout using JwtService — already stateless (stores only `refreshToken` on user doc, not session); uses `RbacRole = 'admin
...(truncated)

### build (2026-04-07T22:05:53)
## Summary

I've completed the auth system refactor. Here's what was done:

### Changes Made

1. **`src/collections/Users.ts`** - Added `roles` field (array of RbacRole) alongside existing `role` field for backwards compatibility

2. **`src/auth/auth-service.ts`** - Added `getPrimaryRole()` helper that checks `roles[0]` first, falls back to `role`, then to `'viewer'`. Updated `login()` and `verifyAccessToken()` to use this helper.

3. **`src/middleware/auth-middleware.ts`** - Removed SessionStor
...(truncated)
