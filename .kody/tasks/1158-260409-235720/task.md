# [run-20260409-2355] T03: Redesign authentication system with JWT and RBAC

## Task
Redesign the authentication system:

1. Replace session-based auth with JWT token authentication
2. Migrate user schema to add roles field (admin, editor, viewer)
3. Add RBAC middleware to protect routes based on roles
4. Update all API routes to use the new auth system

This is a HIGH complexity task that touches multiple files and layers.

## Context
The current session-based auth doesn't scale well for API-only access. We need JWT tokens and role-based access control.

## Acceptance Criteria
- [ ] JWT tokens issued on login
- [ ] Tokens validated on protected routes
- [ ] Role field added to user model
- [ ] RBAC middleware checks user roles
- [ ] All existing tests still pass after migration

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `1158-260409-235720` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24219247471))

To rerun: `@kody rerun 1158-260409-235720 --from <stage>`

