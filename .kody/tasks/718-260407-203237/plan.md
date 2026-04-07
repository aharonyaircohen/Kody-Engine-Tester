Plan created at `.kody/tasks/718-260407-203237/plan.md`.

**Summary**: The JWT auth infrastructure already exists (`AuthService`, `JwtService`, RBAC roles, updated Users collection, `withAuth` HOC). The missing piece is the API route handlers (`/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/register`, `/api/auth/profile`) that the frontend `AuthContext` expects.

The plan covers:
1. Creating the 5 missing auth API routes
2. Marking legacy `session-store.ts` and `user-store.ts` as `@deprecated`
3. Creating a Payload migration for auth schema alignment
