# [run-20260409-2001] T03: Refactor auth system with migration

## Task
Redesign the entire authentication system: replace session-based auth with JWT, migrate the user schema, add RBAC with admin/editor/viewer roles, and update all API routes in src/auth/ and src/middleware/auth-middleware.ts.

## Complexity
Expected: HIGH (risk gate fires, pauses at plan)

## Command
@kody

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `990-260409-200242` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24210635486))

To rerun: `@kody rerun 990-260409-200242 --from <stage>`

**@aharonyaircohen** (2026-04-09):
🤔 **Kody has questions before proceeding:**

1. Should UserStore and SessionStore be removed entirely or kept as deprecated/backup?
2. Are there any API routes in src/app/api/auth/ that need to be updated to ensure they all use the same auth path?
3. Should the migration include updating the Payload user collection schema for the new RbacRole, or is that already aligned?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `990-260409-200718` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24210780485))

To rerun: `@kody rerun 990-260409-200718 --from <stage>`

