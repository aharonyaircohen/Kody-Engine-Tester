# [run-20260407-1802] T03: Refactor auth system with migration

## Task
Redesign the entire authentication system: replace session-based auth with JWT, migrate the user schema, add RBAC with admin/editor/viewer roles, and update all API routes.

## Details
1. Replace `session-store.ts` with `jwt-store.ts` using RS256 tokens
2. Add role-based access control in `src/auth/roles.ts` with admin/editor/viewer permissions
3. Migrate `user-store.ts` schema to include roles array and JWT-specific fields
4. Update all auth middleware to check JWT validity and RBAC permissions
5. Add token refresh endpoint
6. Write migration scripts for existing session-based users

## Complexity
This is a HIGH complexity, multi-file refactor that touches auth, middleware, and API routes.