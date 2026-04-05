# [test-suite] Redesign authentication: replace session auth with JWT, migrate user schema, add RBAC

Complete authentication system redesign:
1. Replace the existing session-based auth in src/auth/ with a new JWT-based system using RS256 signing
2. Migrate the user schema to add roles (admin/editor/viewer) and permissions arrays
3. Add RBAC middleware that checks role-based permissions on every protected route
4. Create a new token refresh mechanism with rotation
5. Add database migration for the new user schema fields
6. Update all existing API routes to use the new RBAC middleware
7. Add comprehensive integration tests for the full auth flow including token refresh and role checks