
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

### review (2026-04-07T19:29:37)
Now I have a complete picture. Let me compile the structured review.

## Verdict: FAIL

## Summary

The auth system refactor introduces JWT-based authentication with new RBAC roles (`admin`, `editor`, `viewer`) replacing legacy roles (`instructor`, `student`, `user`, `guest`). However, the diff is **incomplete** — it only updates `discussions.ts` and `discussions.test.ts` to use the new roles, but misses multiple other consumers that still check for the legacy `'instructor'` and `'student'` role
...(truncated)

### review-fix (2026-04-07T19:33:54)
The remaining TypeScript errors are pre-existing issues (in `pages/`, `tests/helpers/`, and generated `.next/` files) - not related to my RBAC changes. All Critical and Major issues from the review have been fixed.

## Summary of Fixes

### Critical Issues Fixed:

1. **`src/services/grading.ts`** - Updated `Grader` interface to use `role: 'admin' | 'editor' | 'viewer'` and fixed all role checks:
   - `grader.role !== 'instructor'` → `grader.role === 'viewer'` 
   - `grader.role === 'student'` → 
...(truncated)

### review (2026-04-07T19:34:16)
This is a **pure backend auth refactor** — no UI components, pages, or frontend routes were modified. The browser verification requirement in the task template does not apply here. All changed files are in `src/auth/`, `src/api/auth/`, `src/middleware/`, `src/services/`, `src/collections/`, and `src/migrations/` — none of which involve UI rendering.

My structured review above is complete. The browser verification step is not applicable for this task type.


### review-fix (2026-04-07T19:35:23)

All remaining TypeScript errors are **pre-existing** issues unrelated to the RBAC fixes:
- `src/app/(frontend)/*` pages - `id` property type issues (pre-existing)
- `tests/helpers/seedUser.ts` - user seed type issue (pre-existing)

## Review-Fix Complete

All **Critical** and **Major** issues from the code review have been fixed:

### Critical Issues Fixed:
1. **`src/services/grading.ts`** - Updated `Grader` interface and role checks to use new RBAC roles
2. **`src/collections/Courses.ts`** - C
...(truncated)
