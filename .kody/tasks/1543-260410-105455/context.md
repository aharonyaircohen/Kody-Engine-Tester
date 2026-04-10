
### taskify (2026-04-10T11:11:22)
{"task_type":"refactor","title":"Refactor auth system to JWT-only with RBAC","description":"Replace session-based authentication with JWT-only authentication, align user-store.ts roles with RbacRole ('admin'|'editor'|'viewer'), update auth-middleware.ts to remove sessionStore dependency and use jwtService exclusively, create new jwt-auth-store.ts for persistent JWT storage, and add database migration for roles column. This touches src/auth/, src/middleware/, src/collections/, and src/migrations/
...(truncated)

### plan (2026-04-10T11:12:26)
Now I have a complete picture of the auth system. Let me create the implementation plan.

## Existing Patterns Found

- **JWT pattern**: `src/auth/jwt-service.ts` - already handles token creation/verification with blacklist; new `jwt-auth-store.ts` should mirror this pattern
- **Payload auth**: `src/auth/auth-service.ts` - already stores refresh tokens in Payload users collection via `refreshToken`/`tokenExpiresAt` fields
- **Middleware chain**: `src/middleware/auth-middleware.ts` - Express-styl
...(truncated)

### build (2026-04-10T11:22:42)
All implementation tasks are complete. Here's a summary of the changes made:

## Summary of Changes

### New Files Created
1. **`src/auth/jwt-auth-store.ts`** - New JWT token store replacing session-store with token management (create, find, refresh, revoke)
2. **`src/auth/jwt-auth-store.test.ts`** - Tests for the new JWT token store (14 tests)
3. **`src/migrations/20260410_add_roles_column.ts`** - Database migration to add `roles` column to users table

### Files Modified
4. **`src/auth/user-st
...(truncated)
