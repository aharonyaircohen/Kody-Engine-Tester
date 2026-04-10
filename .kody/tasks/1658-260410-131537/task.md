# [run-20260410-1307] T03: Refactor auth system with migration

## Task
Redesign the entire authentication system: replace session-based auth with JWT, migrate the user schema, add RBAC with admin/editor/viewer roles, and update all API routes to use the new auth model.

## Context
The current auth system uses server-side sessions stored in memory. This needs to be replaced with JWT tokens and a role-based access control system to support multi-tenant permissions.

## Scope
This is a HIGH complexity task spanning multiple files:
1. Replace `src/auth/session-store.ts` with JWT-based token validation
2. Update `src/auth/user-store.ts` schema to include roles array
3. Add `src/auth/rbac.ts` with role hierarchy and permission checks
4. Update `src/auth/withAuth.ts` to inject user context from JWT
5. Update all route handlers in `src/auth/` to use new auth model
6. Add database migration script for user schema changes
7. Update tests to reflect new auth flow

## Acceptance Criteria
- JWT tokens issued on login, validated on every protected request
- Role hierarchy: admin > editor > viewer with specific permission masks
- Migration script handles existing user data transformation
- All existing auth tests pass with new model
- Backwards compatibility for API clients updated incrementally

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1658-260410-130939` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24244510810))

To rerun: `@kody rerun 1658-260410-130939 --from <stage>`

**@aharonyaircohen** (2026-04-10):
🤔 **Kody has questions before proceeding:**

1. Should the roles array on User be additive (user has multiple roles) or a single role upgrade from the current enum?
2. Should the migration script handle rollback if issues occur with existing user data transformation?
3. Should existing sessions in session-store be force-expired on migration or allowed to naturally expire?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1658-260410-131537` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24244713712))

To rerun: `@kody rerun 1658-260410-131537 --from <stage>`

