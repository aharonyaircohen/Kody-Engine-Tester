# [run-20260407-2121] T03: Refactor auth system with migration

## Task
Redesign the entire authentication system: replace session-based auth with JWT, migrate the user schema, add RBAC with admin/editor/viewer roles, and update all API routes.

## Requirements
- Replace session-store.ts with JWT-based tokens
- Add role-based access control with three roles: admin, editor, viewer
- Create role guard middleware in src/middleware/rbac.ts
- Migrate user schema to include roles array
- Update all auth-protected routes to use new JWT middleware
- Add comprehensive migration script
- Include tests for all new functionality

---

## Discussion (5 comments)

**@aharonyaircohen** (2026-04-07):
@kody

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `789-260407-212338` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24105089342))

To rerun: `@kody rerun 789-260407-212338 --from <stage>`

**@aharonyaircohen** (2026-04-07):
🤔 **Kody has questions before proceeding:**

1. Should the migration convert existing single `role` values to a `roles` array (e.g., `admin` → `['admin']`) or keep `role` field for backwards compatibility alongside new `roles` array?
2. Is src/middleware/rbac.ts a new file that should be created alongside role-guard.ts, or should role-guard.ts be renamed/refactored into rbac.ts?
3. Should session-store.ts be deleted entirely or kept during transition period?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-07):
@kody approve

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `789-260407-212338` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24106149399))

To rerun: `@kody rerun 789-260407-212338 --from <stage>`

