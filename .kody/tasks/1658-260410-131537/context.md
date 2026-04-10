
### taskify (2026-04-10T13:16:51)

{
  "task_type": "refactor",
  "title": "Refactor auth system to replace session-based auth with JWT and RBAC",
  "description": "Replace session-based authentication (session-store.ts) with JWT token validation, update user-store.ts schema to support roles array, ensure RBAC with admin/editor/viewer hierarchy, and update all route handlers. The existing jwt-service.ts, auth-service.ts, withAuth.ts, and _auth.ts already contain most of the required JWT and RBAC implementation. Task also require
...(truncated)

### plan (2026-04-10T13:18:53)
Now I have a complete picture. Let me create the implementation plan.

## Existing Patterns Found

- `src/auth/_auth.ts:17-21` - `ROLE_HIERARCHY` constant (admin=3, editor=2, viewer=1) — to be extracted to `rbac.ts`
- `src/auth/_auth.ts:37-61` - `checkRole` function with hierarchical inheritance — to be reused in `rbac.ts`
- `src/auth/jwt-service.ts:23-122` - `JwtService` with sign/verify/blacklist — already implemented
- `src/auth/auth-service.ts:62-262` - `AuthService` using Payload CMS + JWT 
...(truncated)

### build (2026-04-10T13:24:45)
## Summary

Successfully implemented the auth system refactoring. Here's what was done:

### Files Created
- **`src/auth/rbac.ts`** — New RBAC module with:
  - `Permission` type for granular permissions
  - `ROLE_HIERARCHY` constant (admin=3, editor=2, viewer=1)
  - `ROLE_PERMISSIONS` mapping role → permission array
  - `hasPermission()` function for permission checking
  - `checkRole()` function (hierarchical role inheritance)
  - `extractBearerToken()` helper

### Files Updated
| File | Change
...(truncated)
