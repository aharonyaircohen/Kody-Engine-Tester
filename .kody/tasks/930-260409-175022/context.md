
### taskify (2026-04-09T18:40:55)
```json
{
  "task_type": "refactor",
  "title": "Refactor auth system to use JWT with RBAC roles array",
  "description": "Redesign authentication from session-based to JWT token-based with RBAC. This involves: (1) Migrating UserStore from single role to roles array with admin/editor/viewer, (2) Consolidating API auth handlers (login.ts, auth-middleware.ts) to use pure JWT approach from AuthService instead of SessionStore+JWT hybrid, (3) Ensuring refresh token rotation is consistently implemente
...(truncated)

### plan (2026-04-09T18:41:54)
Plan written to `.kody/tasks/930-260409-175022/plan.md`. Here's the summary:

## Plan: 8 Steps

1. **Update UserStore** — Migrate `role: UserRole` to `roles: RbacRole[]` array; map seed users (admin→admin, instructor→editor, student→viewer)
2. **Refactor auth-middleware** — Remove SessionStore dependency; use `AuthService.verifyAccessToken()` directly for pure JWT auth
3. **Update login.ts** — Replace UserStore+SessionStore+JwtService hybrid with direct `AuthService.login()` call
4. **Deprecate 
...(truncated)

### build (2026-04-09T18:52:43)
## Summary

I've completed all 8 steps of the plan:

### Changes Made

1. **Updated UserStore** (`src/auth/user-store.ts`)
   - Changed `role: UserRole` to `roles: RbacRole[]` array
   - Mapped seed users: admin→admin, instructor→editor, student→viewer, user→viewer

2. **Refactored auth-middleware** (`src/middleware/auth-middleware.ts`)
   - Removed UserStore, SessionStore, JwtService dependencies
   - Now uses `AuthService.verifyAccessToken()` directly for pure JWT auth
   - Updated AuthContext
...(truncated)
