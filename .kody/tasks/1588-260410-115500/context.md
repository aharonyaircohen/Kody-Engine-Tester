
### taskify (2026-04-10T11:57:52)
Based on my exploration, here's my classification:

```json
{
  "task_type": "refactor",
  "title": "Refactor auth system to use JWT with password history and migration",
  "description": "Replace the hybrid session+JWT auth system with pure JWT-based authentication using AuthService. Add password history field (last 5 passwords) to Users collection. Create migration script to assign 'viewer' role to existing users without a role and add password history field. Deprecate session-store.ts but kee
...(truncated)

### plan (2026-04-10T11:58:59)
Now I have a complete picture. Let me create the implementation plan.

## Existing Patterns Found

- `src/auth/auth-service.ts:62-149` - AuthService.login() using Payload SDK with PBKDF2 password verification (this is the pattern to use for login/migration)
- `src/auth/_auth.ts:17-21` - ROLE_HIERARCHY for RBAC role inheritance (admin>editor>viewer)
- `src/auth/_auth.ts:26-31` - extractBearerToken() helper
- `src/auth/_auth.ts:37-61` - checkRole() for role validation
- `src/migrations/20260405_00
...(truncated)

### build (2026-04-10T12:05:14)
All implementation steps are complete. Here's a summary of the changes made:

## Summary

### 1. `src/collections/Users.ts`
Added `passwordHistory` field (array of `{hash, salt, changedAt}` objects with max 5 rows) to track last 5 passwords.

### 2. `src/migrations/20260410_000000_add_password_history_and_role.ts` (new file)
Migration script that:
- Adds `passwordHistory` column as JSONB
- Assigns 'viewer' role to users without a role

### 3. `src/auth/auth-service.ts`
Added `changePassword()` m
...(truncated)
