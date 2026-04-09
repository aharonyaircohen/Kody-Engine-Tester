# [run-20260409-2239] T03: Complete auth system redesign with JWT migration

## Task
Redesign the entire authentication system:

1. Replace session-based auth with JWT tokens
2. Migrate user schema from `{id, email, password}` to `{id, email, passwordHash, roles[], createdAt, updatedAt}`
3. Add RBAC with admin/editor/viewer roles
4. Update all API routes to use new auth pattern
5. Add refresh token rotation
6. Create migration script from old to new schema

## Context
This is a high-risk migration affecting multiple core systems. Risk gate should fire for review.

## Expected Complexity
HIGH — multiple interdependent files, database migration, security implications

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `1079-260409-224235` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24216888649))

To rerun: `@kody rerun 1079-260409-224235 --from <stage>`

