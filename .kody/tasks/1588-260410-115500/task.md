# [run-20260410-1148] T03: Refactor auth system with migration

## Task
Redesign the entire authentication system: replace session-based auth with JWT, migrate the user schema, add RBAC with admin/editor/viewer roles, and update all API routes.

## Requirements
- Replace session-store.ts with JWT-based authentication
- Add role-based access control (admin, editor, viewer roles)
- Create new user schema with roles field and password history
- Migrate all existing auth endpoints to use new JWT strategy
- Update withAuth.ts to validate JWT and check roles
- Add migration script for existing user data
- Include comprehensive tests for all scenarios

## Context
The current session-based auth needs to be modernized to support stateless APIs and fine-grained access control. This affects multiple subsystems.


---

## Discussion (5 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1588-260410-114930` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24241458372))

To rerun: `@kody rerun 1588-260410-114930 --from <stage>`

**@aharonyaircohen** (2026-04-10):
🤔 **Kody has questions before proceeding:**

1. Should user-store.ts be removed entirely or kept as a fallback for backward compatibility during migration?
2. What is the password history retention policy (number of previous passwords to track)?
3. Should existing users without a role be assigned 'viewer' role during migration?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-10):
@kody approve

1. Keep user-store.ts as a fallback for backward compatibility during migration
2. Track last 5 passwords in password history
3. Assign 'viewer' role to existing users without a role during migration

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1588-260410-115500` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24241602461))

To rerun: `@kody rerun 1588-260410-115500 --from <stage>`

