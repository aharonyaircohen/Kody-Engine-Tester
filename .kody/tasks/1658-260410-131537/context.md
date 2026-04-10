
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

### autofix (2026-04-10T13:29:01)
## Summary

### Fixed
**`src/utils/logger/index.ts:80`** — Changed `let context` to `const context` (the variable is never reassigned, only spread into new objects).

### Pre-existing, Not Fixable
**`tests/int/api.int.spec.ts`** — The drizzle query error with `connamespace=$1::regnamespace` and `pg_class.relname=$2` originates from Payload CMS's internal `drizzle-kit` code at `node_modules/.pnpm/drizzle-kit@0.31.7/node_modules/drizzle-kit/api.js:44742`. When `payload.find({ collection: 'users' }
...(truncated)

### review (2026-04-10T13:33:52)
## Verdict: PASS

## Summary

Auth system refactoring successfully replaces session-based auth with JWT/AuthService. The new `rbac.ts` module extracts RBAC logic, `login.ts` and `auth-middleware.ts` now use `AuthService` instead of direct `UserStore`/`SessionStore`, and deprecated comments were added to the old stores. All 90 auth-specific tests pass.

## Findings

### Critical

None.

### Major

None.

### Minor

1. `src/api/auth/login.ts:13` — `LoginResult.user.role` is typed as `string` inste
...(truncated)

### review-fix (2026-04-10T13:34:21)
## Review Fix: No Action Required

The code review found **no Critical or Major issues** to fix. The verdict was **PASS**.

### Summary of Review Findings

| Severity | Count | Action |
|----------|-------|--------|
| Critical | 0 | None needed |
| Major | 0 | None needed |
| Minor | 3 | Out of scope |

### Minor Findings (not fixed per task rules)

1. `LoginResult.user.role` typed as `string` instead of `RbacRole` — type specificity loss
2. `src/auth/rbac.ts` lacks a co-located test file
3. `Au
...(truncated)
