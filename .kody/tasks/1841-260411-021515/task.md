# [run-20260411-0214] T03: Refactor auth system with migration

Redesign the entire authentication system: replace session-based auth with JWT, migrate the user schema, add RBAC with admin/editor/viewer roles, and update all API routes.

Specifically:
1. Create new JWT-based auth service in src/auth/jwt-auth.ts
2. Add user migration script in src/migrations/001_add_jwt_fields.ts
3. Create RBAC role system in src/auth/rbac.ts with admin/editor/viewer roles
4. Update all existing auth middleware to work with JWT
5. Update user model to support JWT tokens and roles
6. Add tests for all new components

This is a HIGH complexity task that should trigger the risk gate.

---

## Discussion (5 comments)

**@aharonyaircohen** (2026-04-11):
@kody

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `1841-260411-021515` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24272361183))

To rerun: `@kody rerun 1841-260411-021515 --from <stage>`

**@aharonyaircohen** (2026-04-11):
🤔 **Kody has questions before proceeding:**

1. The task specifies src/auth/jwt-auth.ts but jwt-service.ts already provides this functionality. Should the file be renamed or is the current implementation acceptable?
2. The task specifies src/auth/rbac.ts but RBAC is already in _auth.ts. Should this be split into a separate file?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-11):
@kody approve

1. Use existing jwt-service.ts instead of creating jwt-auth.ts
2. Use existing RBAC implementation in _auth.ts instead of creating rbac.ts

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `1841-260411-021515` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24272419697))

To rerun: `@kody rerun 1841-260411-021515 --from <stage>`

