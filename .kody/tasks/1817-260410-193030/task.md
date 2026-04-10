# [run-20260410-1924] T03: Refactor auth system with migration

## Task
Redesign the entire authentication system: replace session-based auth with JWT, migrate the user schema, add RBAC with admin/editor/viewer roles, and update all API routes.

This is a HIGH complexity task that should trigger the risk gate.

Steps:
1. Replace session-store.ts with jwt-service.ts as the primary auth mechanism
2. Add RBAC roles (admin, editor, viewer) to user-store.ts
3. Create migration file in src/migrations/ to update user schema
4. Update all auth middleware to use new JWT-based approach
5. Update withAuth.ts to check roles

Expected: Risk gate should fire, requiring approval before proceeding.

---

## Discussion (5 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1817-260410-192551` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24260249705))

To rerun: `@kody rerun 1817-260410-192551 --from <stage>`

**@aharonyaircohen** (2026-04-10):
🤔 **Kody has questions before proceeding:**

1. Should session-store.ts be deleted entirely or kept as a fallback?
2. What should happen to existing sessions during the migration - should they be invalidated or allowed to expire naturally?
3. The user-store uses UserRole (admin/user/guest/student/instructor) while RBAC uses RbacRole (admin/editor/viewer). Which set should be the source of truth after migration?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-10):
@kody approve

1. Keep UserStore as a fallback for non-Payload operations during migration
2. Allow existing sessions to expire naturally during migration
3. Align UserRole to RbacRole — make RbacRole the source of truth

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1817-260410-193030` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24260392407))

To rerun: `@kody rerun 1817-260410-193030 --from <stage>`

