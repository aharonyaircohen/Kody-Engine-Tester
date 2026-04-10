
### taskify (2026-04-10T19:32:29)
Based on my exploration, here's my classification:

```json
{
  "task_type": "refactor",
  "title": "Refactor auth system to align JWT/RBAC and remove session-store dependency",
  "description": "The codebase already has jwt-service.ts with proper RbacRole (admin/editor/viewer), but user-store.ts still uses non-aligned UserRole (admin/user/guest/student/instructor). Additionally, auth-middleware.ts and auth/login.ts use a hybrid approach - JWT for tokens but session-store for validation. This ta
...(truncated)

### plan (2026-04-10T19:33:22)
Now I have a complete picture. The Payload `Users` collection already uses `['admin', 'editor', 'viewer']` - aligned with `RbacRole`. The issue is `user-store.ts` uses a divergent `UserRole` type, and `auth-middleware.ts`/`auth/login.ts` use a hybrid JWT+SessionStore approach.

## Plan

**Step 1: Update `src/auth/user-store.ts` to use RbacRole**
- Change `UserRole` type export to alias `RbacRole` from `jwt-service`
- Update seed users to use valid RbacRole values
- **Verify:** `pnpm test:int src
...(truncated)

### build (2026-04-10T19:39:56)
All tasks completed successfully. Here's a summary of the changes:

## Summary of Changes

### Step 1: `src/auth/user-store.ts`
- Changed `UserRole` type to alias `RbacRole` from `jwt-service` (instead of `'admin' | 'user' | 'guest' | 'student' | 'instructor'`)
- Updated seed users to use valid `RbacRole` values: `admin`, `editor`, `viewer` (replacing `instructor`, `student`, `user`)
- Changed default role from `'user'` to `'viewer'`

### Step 2: `src/auth/index.ts`
- Added `RbacRole` to the exp
...(truncated)
