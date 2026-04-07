
### taskify (2026-04-07T19:15:13)
```json
{
  "task_type": "refactor",
  "title": "Refactor auth system with JWT and RBAC migration",
  "description": "Replace session-based auth with JWT-only validation, migrate user schema to include roles array, add proper RBAC with admin/editor/viewer roles, and update all dependent API routes. Requires creating migration script for existing user data and handling role mapping from legacy roles.",
  "scope": [
    "src/auth/session-store.ts",
    "src/auth/user-store.ts",
    "src/auth/withA
...(truncated)

### plan (2026-04-07T19:16:16)
## Existing Patterns Found

- `src/auth/auth-service.ts` — Full JWT-based auth using Payload CMS with `login()`, `refresh()`, `verifyAccessToken()`, and `logout()` methods following PBKDF2 password hashing
- `src/auth/jwt-service.ts` — JWT signing/verification with `signAccessToken()` (15min) and `signRefreshToken()` (7 days), plus token blacklisting
- `src/auth/_auth.ts:17-21` — `ROLE_HIERARCHY` constant mapping `admin > editor > viewer` with numeric levels
- `src/auth/_auth.ts:37-61` — `checkR
...(truncated)

### build (2026-04-07T19:25:06)
## Summary

Successfully refactored the authentication system. Here's what was done:

### Files Created
- **`src/migrations/20260407_000000_migrate_auth_to_jwt_rbac.ts`** - Database migration adding `roles` column, `rbacRole` column, and `sessionRevokedAt` timestamp
- **`src/auth/rbac.ts`** - New dedicated RBAC module with `ROLE_HIERARCHY`, `checkRole`, `canAccessRole`, and `hasPermission` functions
- **`src/auth/auth-migration.test.ts`** - Integration tests for the auth migration

### Files Mod
...(truncated)
