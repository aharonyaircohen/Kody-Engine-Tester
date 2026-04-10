
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

### review (2026-04-10T12:24:21)
## Verdict: FAIL

## Summary

Refactors authentication to use JWT-based `AuthService` with password history tracking. Adds `changePassword()` method with reuse prevention (last 5 passwords), migration for `passwordHistory` column and `role` assignment, and simplifies login/auth-middleware to delegate to `AuthService`. The `RbacRole` enum is now duplicated across two files, and the `changePassword()` method has a race condition in its password history check.

## Findings

### Critical

1. **`src/
...(truncated)

### review-fix (2026-04-10T12:30:38)
All Critical and Major issues have been fixed. Here's a summary:

## Fixes Applied

### Critical: Race condition in `changePassword()` 
**File:** `src/auth/auth-service.ts`

Fixed by:
1. Added early return if new password equals current hash (prevents redundant updates)
2. Added verification after update - re-reads the user and confirms the new hash was actually stored
3. Throws 409 Conflict error if the stored hash doesn't match what was set (detects concurrent modifications)

### Major: Migrat
...(truncated)

### review (2026-04-10T12:31:40)
## Verdict: FAIL

## Summary

Refactors authentication to use JWT-based `AuthService` with password history tracking. Adds `changePassword()` with reuse prevention, migration for `passwordHistory` and `role` columns, and simplifies login/auth-middleware to delegate to `AuthService`. The prior `RbacRole` duplication was fixed by re-exporting from `jwt-service`, but the `changePassword()` race condition comment is inaccurate — no row lock is actually acquired.

## Findings

### Critical

1. **`src
...(truncated)

### review-fix (2026-04-10T12:49:23)
All Critical and Major issues from the review have been fixed. Here's a summary:

## Fixes Applied

### Critical: Misleading comment in `changePassword()`
**File:** `src/auth/auth-service.ts`

Removed the inaccurate comment claiming `FOR UPDATE` lock hint when using `payload.find()`. The actual implementation uses Payload's query which doesn't support row-level locking.

### Major: Unit tests for `changePassword()`
**File:** `src/auth/auth-service.test.ts`

Added comprehensive tests covering:
- 
...(truncated)

### review (2026-04-10T12:50:11)
## Verdict: PASS

## Summary

Refactors authentication to use JWT-based `AuthService` with password history tracking and reuse prevention. Adds `changePassword()` with verification-based concurrency detection, migration for `passwordHistory` and `role` columns, and simplifies login/auth-middleware to delegate to `AuthService`. Prior review issues (misleading `FOR UPDATE` comment, missing tests, `RbacRole` duplication) have been resolved.

## Findings

### Critical

None.

### Major

None.

### M
...(truncated)

### review-fix (2026-04-10T12:50:28)
The code review has passed! All Critical and Major issues have been resolved.

## Final Summary

### Changes Made

**1. `src/collections/Users.ts`**
- Added `passwordHistory` field (array of `{hash, salt, changedAt}` objects with max 5 rows) to track last 5 passwords

**2. `src/migrations/20260410_000000_add_password_history_and_role.ts`** (new file)
- Migration script that adds `passwordHistory` column as JSONB
- Assigns 'viewer' role to users without a role
- Properly orders operations: UPDATE
...(truncated)
