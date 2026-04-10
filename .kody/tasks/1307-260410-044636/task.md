# [run-20260410-0437] T03: Refactor auth system with migration

## Task
Redesign the entire authentication system: replace session-based auth with JWT, migrate the user schema, add RBAC with admin/editor/viewer roles, and update all API routes to use the new auth strategy.

## Details
- Replace `src/auth/session-store.ts` with JWT token handling in `src/auth/jwt-store.ts`
- Add role-based access control middleware in `src/middleware/rbac.ts`
- Update all API routes in `src/routes/` to use new JWT auth
- Create migration guide in `docs/auth-migration.md`

## Acceptance Criteria
- [ ] JWT authentication replaces session auth
- [ ] RBAC roles: admin, editor, viewer
- [ ] All existing tests pass after migration
- [ ] Migration documented

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1307-260410-044001` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24226700318))

To rerun: `@kody rerun 1307-260410-044001 --from <stage>`

**@aharonyaircohen** (2026-04-10):
🤔 **Kody has questions before proceeding:**

1. Should jwt-store.ts use Payload DB for token storage (like auth-service.ts) or remain in-memory (like session-store.ts)?
2. The task mentions RBAC roles admin/editor/viewer but user-store.ts uses UserRole with 5 values (admin/user/guest/student/instructor). What is the mapping strategy between these two systems?
3. Should session-store.ts be deleted or kept as deprecated for backwards compatibility during migration?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1307-260410-044636` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24226814370))

To rerun: `@kody rerun 1307-260410-044636 --from <stage>`

