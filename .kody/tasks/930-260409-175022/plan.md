Plan written to `.kody/tasks/930-260409-175022/plan.md`. Here's the summary:

## Plan: 8 Steps

1. **Update UserStore** — Migrate `role: UserRole` to `roles: RbacRole[]` array; map seed users (admin→admin, instructor→editor, student→viewer)
2. **Refactor auth-middleware** — Remove SessionStore dependency; use `AuthService.verifyAccessToken()` directly for pure JWT auth
3. **Update login.ts** — Replace UserStore+SessionStore+JwtService hybrid with direct `AuthService.login()` call
4. **Deprecate session-store** — Mark with JSDoc, no functional changes
5. **Update auth/index.ts** — Export `AuthService` alongside existing exports
6. **Update user-store.test.ts** — Change `user.role` assertions to `user.roles` array
7. **Update auth-middleware.test.ts** — Remove SessionStore references from test helper; pure JWT tokens only
8. **Run all auth tests** — Verify everything passes

## Key Clarification Needed

The task references `src/auth/role-guard.ts` which doesn't exist. The existing RBAC infrastructure is split between:
- `src/middleware/role-guard.ts` — `requireRole()` guard factory
- `src/auth/_auth.ts` — `checkRole()` + `ROLE_HIERARCHY`

Should `src/auth/role-guard.ts` be created as a new file, or does the task describe the existing middleware-based RBAC?
