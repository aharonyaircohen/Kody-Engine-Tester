# [run-20260410-0941] T03: Refactor auth system with migration

## Task
Redesign the entire authentication system: replace session-based auth with JWT, migrate the user schema, add RBAC with admin/editor/viewer roles, and update all API routes. This is a HIGH complexity task that touches multiple layers.

## Scope
- Add JWT service in src/auth/jwt-v2.ts (new file, not replacing old one)
- Add RBAC middleware in src/middleware/rbac.ts
- Update src/auth/_auth.ts to support both old and new modes during migration
- Add migration guide in docs/jwt-migration.md
- All changes must be backwards compatible during migration period

## Acceptance Criteria
- JWT tokens are RS256 signed
- RBAC middleware correctly gates admin/editor/viewer routes
- Migration doc explains rollback procedure
- All existing auth tests still pass

---

## Discussion (5 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1490-260410-094253` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24236819173))

To rerun: `@kody rerun 1490-260410-094253 --from <stage>`

**@aharonyaircohen** (2026-04-10):
🤔 **Kody has questions before proceeding:**

1. Should JWT v2 tokens use the same Payload user collection schema or require a new 'jwtV2Users' collection during migration?
2. What is the migration period duration before the old HS256 system is fully deprecated?
3. Should the RBAC middleware support the legacy UserRole types ('admin'|'user'|'guest'|'student'|'instructor') alongside the new RbacRole ('admin'|'editor'|'viewer') during the transition?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-10):
@kody approve
1. Use the same Payload user collection schema for JWT v2 tokens during migration for simplicity
2. Migration period should be 30 days before HS256 is fully deprecated
3. Yes, RBAC middleware should support hierarchical roles with admin > editor > viewer

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1490-260410-094253` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24237708750))

To rerun: `@kody rerun 1490-260410-094253 --from <stage>`

