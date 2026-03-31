# [test-suite] Refactor auth system with migration

Refactor the authentication system to use a proper session-based approach:

1. Create a src/auth/ module with: sessionStore.ts (in-memory session store with TTL, get/set/delete/cleanup), authMiddleware.ts (validate session tokens from Authorization header), authController.ts (login/logout/me), authRoutes.ts (POST /auth/login, POST /auth/logout, GET /auth/me)

2. Add comprehensive tests for each module

3. Register auth routes in the app

4. Create a migration script scripts/migrate-auth.ts that documents the migration steps

This is a high-complexity task involving multiple new files, architectural decisions, and cross-cutting concerns.