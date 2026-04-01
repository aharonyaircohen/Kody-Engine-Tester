Plan created at `.kody/tasks/228-260401-065328/PLAN.md`.

## Summary

The existing auth system is already well-built with JWT, token rotation, and OAuth2 providers. The main gaps are:

1. **No provider linking** — Users can't link multiple OAuth providers to one account
2. **Missing RBAC roles** — Need `admin | editor | viewer` in addition to existing roles
3. **No migration** for new user schema fields

## Key Questions Requiring Your Input

1. **Role hierarchy:** Should `admin` supersede `editor` and `viewer` (i.e., admin can do everything editor can)? Or are these strictly separate roles?

2. **Existing roles:** Should we replace `instructor | student | user | guest` with `admin | editor | viewer`, or keep them and add the new roles alongside?

3. **OAuth linking UX:** Should linking require password confirmation if the account has a password, or is linking via active session sufficient?
