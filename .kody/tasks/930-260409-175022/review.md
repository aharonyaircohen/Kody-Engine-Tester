The auth flow is consistent:
- Routes use `withAuth` HOC → `AuthService.verifyAccessToken()` → returns `AuthenticatedUser` with `role: RbacRole` singular
- `role-guard.ts` now uses `AuthenticatedUser` with `role` singular — consistent
- `discussions.ts` uses `User` from `user-store` with `roles` array — different type, but that's intentional (user-store is the internal store)

Let me now provide the review:

## Verdict: PASS

## Summary

The previous review identified critical failures in `login.test.ts` (signature mismatch) and a type inconsistency in `role-guard.ts`. The fixes correctly: (1) rewrote `login.test.ts` to use `AuthService` with proper mocks matching the new 3-arg signature, (2) aligned `role-guard.ts` to use `AuthenticatedUser` (with `role` singular) consistent with the actual auth flow, (3) tightened `LoginResult.user.role` to `RbacRole` instead of loose `string`. All 5 auth test suites (login, role-guard, user-store, auth-service, auth-middleware) now pass.

## Findings

### Critical

None.

### Major

None.

### Minor

**`src/api/auth/login.test.ts:59`** — Two test cases were removed: `should return 423 for locked account` (testing UserStore lockout behavior) and `should increment failed attempts on wrong password`. These tested session-store lockout and failed-login tracking — behaviors that `AuthService.login()` delegates to Payload CMS rather than in-memory tracking. The removals are functionally correct since the new implementation doesn't replicate UserStore lockout. However, coverage for Payload-based account lockout behavior is now absent. If lockout is a requirement, it should be covered by integration tests hitting the actual Payload backend.

**`src/middleware/role-guard.ts:20`** — `if (!context.user.role)` accepts an empty string `''` as falsy and would then call `ROLE_HIERARCHY['']` which returns `undefined`, making `userRoleLevel` be `undefined`, then `undefined >= ROLE_HIERARCHY[requiredRole]` is always `false`, correctly returning 403. This works but is implicit. A more explicit check like `if (!context.user.role || !(context.user.role in ROLE_HIERARCHY))` would be safer.

### Pass 2 (Informational)

**Type consistency confirmed** — `AuthenticatedUser.role` (singular `RbacRole`) is used in: `withAuth.ts` → `checkRole()` → `role-guard.ts`. The `User.roles` array type remains in `user-store.ts` (used by `DiscussionService`) and `UserStore` internal. The two-user-type pattern (internal store vs Payload-based auth) is an acknowledged project architecture characteristic, not introduced by this diff.

**Enum completeness** — No new enum values introduced. The `RbacRole` set `admin | editor | viewer` is unchanged.

**Security observations** — The refactor removes the session-store session-replacement detection (generation bump). Token revocation now relies solely on JWT expiration/blacklist rather than session invalidation. This is a known trade-off of pure JWT auth and is consistent with the task requirement to "replace session IDs with JWT tokens."
