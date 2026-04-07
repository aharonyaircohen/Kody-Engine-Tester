# [run-20260407-2330] T03: Refactor auth system with migration

## Task
Redesign the entire authentication system: replace session-based auth with JWT, migrate the user schema, add RBAC with admin/editor/viewer roles, update all API routes, and create database migrations for the schema changes. This is a high-risk refactor affecting multiple layers.

## Complexity
high

## Acceptance Criteria
- JWT replaces session-based auth
- User schema updated with new fields
- RBAC roles (admin/editor/viewer) implemented
- All API routes updated
- Database migrations created
- Risk gate must be acknowledged before proceeding

---

## Discussion (5 comments)

**@aguyaharonyair** (2026-04-07):
@kody

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `718-260407-203237` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24102997715))

To rerun: `@kody rerun 718-260407-203237 --from <stage>`

**@aharonyaircohen** (2026-04-07):
🤔 **Kody has questions before proceeding:**

1. Should user-store.ts and session-store.ts be deleted entirely or kept as deprecated stubs for backwards compatibility during migration?
2. The task mentions 'migrate user schema' - should the existing Users collection fields (firstName, lastName, bio, etc.) be modified, or just the role system alignment?
3. The acceptance criteria mentions 'database migrations' - is there an existing migration framework ( Payload migrate CLI) that should be used, or a custom migration approach?

Reply with `@kody approve` and your answers in the comment body.

**@aguyaharonyair** (2026-04-07):
@kody approve
1. Keep session-store.ts and user-store.ts as deprecated stubs for backwards compatibility during migration
2. Modify the existing Users collection fields to align with new role system — add role field, remove session-specific fields
3. Use Payload's built-in migrate CLI framework for database migrations

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `718-260407-203237` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24103428444))

To rerun: `@kody rerun 718-260407-203237 --from <stage>`

