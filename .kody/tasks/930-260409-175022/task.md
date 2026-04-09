# [run-20260409-1749] T03: Refactor auth system with migration

## Task
Redesign the entire authentication system:
1. Replace session-based auth with JWT tokens
2. Migrate the user schema in src/auth/user-store.ts to add a `roles` array field with admin/editor/viewer roles
3. Add RBAC (role-based access control) to src/auth/role-guard.ts
4. Update all API route handlers in src/auth/ that use the old session approach to use the new JWT approach
5. Add refresh token rotation to src/auth/jwt-service.ts
6. Update all existing tests to work with the new JWT-based auth

This is a HIGH complexity task that should trigger the risk gate and pause at the plan stage.

## Acceptance Criteria
- JWT tokens replace session IDs in auth flow
- User store has roles array with RBAC enforcement
- All auth tests pass with the new implementation
- API routes updated to use Bearer token auth

---

## Discussion (5 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `930-260409-175022` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24204962203))

To rerun: `@kody rerun 930-260409-175022 --from <stage>`

**@aharonyaircohen** (2026-04-09):
🤔 **Kody has questions before proceeding:**

1. Should UserStore be deprecated in favor of AuthService (Payload-based), or should both coexist with UserStore used only for testing?
2. The task mentions 'roles array with admin/editor/viewer' - should existing UserRole values (student, instructor, guest) be mapped to these three roles, or should the migration support multiple role assignments per user?
3. Should the migration include a data migration script to update existing user records in Payload CMS with the new roles array format?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-09):
@kody approve

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `930-260409-175022` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24207060192))

To rerun: `@kody rerun 930-260409-175022 --from <stage>`

