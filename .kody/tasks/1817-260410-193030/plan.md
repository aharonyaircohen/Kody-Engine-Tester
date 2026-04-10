Now I have a complete picture. The Payload `Users` collection already uses `['admin', 'editor', 'viewer']` - aligned with `RbacRole`. The issue is `user-store.ts` uses a divergent `UserRole` type, and `auth-middleware.ts`/`auth/login.ts` use a hybrid JWT+SessionStore approach.

## Plan

**Step 1: Update `src/auth/user-store.ts` to use RbacRole**
- Change `UserRole` type export to alias `RbacRole` from `jwt-service`
- Update seed users to use valid RbacRole values
- **Verify:** `pnpm test:int src/auth/user-store.test.ts`

**Step 2: Update `src/auth/index.ts` to re-export RbacRole**
- Add RbacRole to exports alongside UserRole (for backward compat during migration)
- **Verify:** `pnpm test:int src/auth/`

**Step 3: Refactor `src/middleware/auth-middleware.ts` to stateless JWT**
- Remove `SessionStore` dependency
- JWT verification only (generation check via token payload, not session store)
- Rename to `createJwtMiddleware` (keep original for fallback per discussion)
- **Verify:** `pnpm test:int src/middleware/auth-middleware.test.ts`

**Step 4: Update `src/api/auth/login.ts` to stateless JWT**
- Remove `SessionStore` from login flow
- Return JWT tokens without creating sessions
- **Verify:** `pnpm test:int src/api/auth/login.test.ts`

**Step 5: Create migration for role alignment**
- Add `src/migrations/20260410_000000_align_user_roles.ts`
- Migration is informational since Payload collection already uses correct roles
- **Verify:** `pnpm migrate`

**Step 6: Update test files**
- Update `src/auth/user-store.test.ts` - remove old role assertions (student, instructor, guest users no longer seeded)
- Update `src/middleware/auth-middleware.test.ts` - remove sessionStore dependency
- **Verify:** `pnpm test:int`

---

## Existing Patterns Found

- **Migration pattern** (`src/migrations/20260405_000000_add_users_permissions_lastLogin.ts`): `up`/`down` functions using `MigrateUpArgs`/`MigrateDownArgs` — reused for Step 5
- **JWT stateless verification** (`src/auth/auth-service.ts`): `verifyAccessToken` is already stateless — reference for refactoring auth-middleware
- **RbacRole alignment** (`src/collections/Users.ts`): Payload collection already uses `['admin', 'editor', 'viewer']` — user-store should match this
- **HOC auth wrapper** (`src/auth/withAuth.ts`): Already handles role checking via `checkRole` — no changes needed here

## Questions

None — the task is clear from task.json and discussion approvals.
