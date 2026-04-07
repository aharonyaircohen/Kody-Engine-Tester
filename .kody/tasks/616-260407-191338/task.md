# [run-20260407-1908] T03: Refactor auth system with migration

## Task
Redesign the entire authentication system: replace session-based auth with JWT, migrate the user schema, add RBAC with admin/editor/viewer roles, and update all API routes.

This involves:
1. Replace src/auth/session-store.ts with JWT-based token validation
2. Update src/auth/user-store.ts schema to include roles array
3. Create src/auth/rbac.ts with role permission checks
4. Update src/auth/withAuth.ts to verify JWT tokens and extract roles
5. Update all API route handlers that use the old session auth
6. Add migration script for existing user data

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-07):
@kody

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `616-260407-190902` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24099507394))

To rerun: `@kody rerun 616-260407-190902 --from <stage>`

**@aharonyaircohen** (2026-04-07):
🤔 **Kody has questions before proceeding:**

1. Should the old UserStore (SHA-256) be deprecated entirely in favor of AuthService (PBKDF2), or should they coexist during a transition period?
2. Should the migration script map the old roles (student/instructor) to new roles (viewer/editor) or should there be a new 'instructor' role added to RbacRole?
3. Should existing sessions in session-store.ts be invalidated immediately upon migration, or should there be a grace period for token refresh?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `616-260407-191338` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24099629972))

To rerun: `@kody rerun 616-260407-191338 --from <stage>`

