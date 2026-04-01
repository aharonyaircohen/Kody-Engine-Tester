# [test-suite] Redesign authentication system with OAuth and RBAC

Redesign the entire authentication system:
1. Replace the current session-based auth in src/auth/ with a new OAuth2-compatible flow supporting Google, GitHub, and email/password providers
2. Migrate the user schema to support multiple OAuth providers per user, add provider_id, provider_type, and linked_accounts fields
3. Implement a full RBAC system with admin, editor, and viewer roles - add role-based access control to all existing API routes
4. Add a token refresh mechanism with rotation and revocation support
5. Create database migration scripts in src/migrations/ for the schema changes
6. Update all existing middleware to use the new auth system
7. Add comprehensive integration tests for the entire auth flow including token refresh, role checks, and provider linking