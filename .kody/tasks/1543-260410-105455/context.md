
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

### review (2026-04-10T11:31:34)
Now I have enough information to provide the structured review.

---

## Verdict: FAIL

## Summary

The auth system refactor introduces JWT-only authentication with RBAC role alignment. However, there is a **critical bug in the login flow** where tokens returned to users would immediately fail authentication on the first request due to a generation mismatch. Additionally, the profile page references a non-existent sessions API endpoint.

## Findings

### Critical

**`src/api/auth/login.ts:55-64`
...(truncated)

### review-fix (2026-04-10T11:35:48)
All TypeScript checks pass for the changed files. Here's a summary of the review fixes:

## Summary of Fixes

### Critical Fixes

**1. Login flow generation mismatch bug (`src/api/auth/login.ts`)**

The bug: `refresh()` was being called after login which incremented the stored token's generation to 1, but the re-signed JWTs still carried `generation: 0`. This caused the middleware to reject every token on first use (`0 < 1` comparison).

Fix: Instead of calling `refresh()` (which always incremen
...(truncated)

### review (2026-04-10T11:37:37)
All auth-related tests pass. Let me do the review.

---

## Verdict: PASS

## Summary

The auth system refactor replaces session-based authentication with JWT-only authentication, aligning `UserStore` roles with `RbacRole` ('admin'|'editor'|'viewer'). All critical issues from the previous review have been addressed — the login generation mismatch is fixed, and the profile page session revocation issue is noted as a minor gap.

## Findings

### Critical

None.

### Major

**`src/api/auth/login.ts
...(truncated)

### review-fix (2026-04-10T11:39:42)
All auth tests pass. The only failing test is the pre-existing `tests/int/api.int.spec.ts` with database connection issues (unrelated to my changes).

## Summary of Fix

**Major issue fixed: Encapsulated private property mutation in `JwtAuthStore`**

Added a new public `updateTokens(oldToken: string, newToken: string, newRefreshToken: string)` method to `JwtAuthStore` that encapsulates the token update logic. This method:
- Updates the stored token entry
- Updates the tokens map
- Updates the to
...(truncated)
