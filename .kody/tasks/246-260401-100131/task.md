# [test-suite] Redesign authentication: replace sessions with JWT + OAuth + RBAC

Complete authentication system redesign:
1. Replace the current session-based auth in src/auth/ with JWT tokens (access + refresh)
2. Add OAuth2 provider support (Google, GitHub) with provider linking
3. Implement full RBAC system with admin/editor/viewer roles across all API routes
4. Create migration scripts in src/migrations/ for user schema changes (add provider_id, provider_type, linked_accounts, roles fields)
5. Add token rotation with configurable expiry (15min access, 7d refresh)
6. Update all existing middleware to use the new JWT-based auth
7. Add comprehensive integration tests for the entire auth flow