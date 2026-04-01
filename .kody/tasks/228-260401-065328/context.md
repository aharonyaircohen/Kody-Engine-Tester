
### taskify (2026-04-01T06:54:47)
{
"task_type": "feature",
"title": "Redesign authentication system with OAuth2 and full RBAC",
"description": "Replace session-based auth in src/auth/ with OAuth2-compatible flow supporting Google, GitHub, and email/password providers. Migrate user schema to support multiple OAuth providers per user with provider_id, provider_type, and linked_accounts fields. Implement RBAC system with admin, editor, and viewer roles, adding role-based access control to all API routes. Add token refresh mechanis
...(truncated)

### plan (2026-04-01T06:56:05)
Plan created at `.kody/tasks/228-260401-065328/PLAN.md`.

## Summary

The existing auth system is already well-built with JWT, token rotation, and OAuth2 providers. The main gaps are:

1. **No provider linking** — Users can't link multiple OAuth providers to one account
2. **Missing RBAC roles** — Need `admin | editor | viewer` in addition to existing roles
3. **No migration** for new user schema fields

## Key Questions Requiring Your Input

1. **Role hierarchy:** Should `admin` supersede `edit
...(truncated)

### build (2026-04-01T06:56:29)
I've asked the 3 design questions. Once you answer them, I'll proceed with the implementation following the plan.

