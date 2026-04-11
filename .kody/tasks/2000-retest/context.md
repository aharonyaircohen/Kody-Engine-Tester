
### taskify (2026-04-11T20:53:13)
Based on my exploration of the codebase, I can now classify this task.

```json
{
  "task_type": "refactor",
  "title": "Refactor auth system to stateless JWT with RBAC",
  "description": "Redesign the authentication system to replace session-based auth with stateless JWT tokens. This involves removing the SessionStore dependency from API routes, migrating the UserStore schema to use a roles array aligned with the existing RbacRole type ('admin'|'editor'|'viewer'), creating a dedicated rbac.ts m
...(truncated)

### build (2026-04-11T21:04:00)
All 76 auth tests pass. Here's a summary of the changes I made to complete the auth system refactor:

## Changes Made

### 1. Created `src/auth/rbac.ts` (NEW FILE)
Centralized RBAC utilities:
- `RbacRole` type re-exported from `_auth`
- `ROLE_HIERARCHY` constant (admin=3, editor=2, viewer=1)
- `checkRole()` function for checking user roles
- `requireRole()` factory function for creating role guards

### 2. Updated `src/auth/_auth.ts`
- Now defines and exports `RbacRole = 'admin' | 'editor' | 'vi
...(truncated)
