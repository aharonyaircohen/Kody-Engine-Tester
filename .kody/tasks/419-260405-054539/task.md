# [test-suite] Redesign authentication: replace sessions with JWT, add RBAC, migrate user schema

Complete authentication system redesign:

1. **Replace session-based auth with JWT**: Remove session store dependency, implement access + refresh token pair, add token rotation on refresh
2. **Migrate user schema**: Add roles field (admin/editor/viewer), add permissions array, add lastLogin timestamp, write migration script
3. **Add RBAC middleware**: Role-based access control that checks user.roles against route requirements, support hierarchical roles (admin > editor > viewer)
4. **Update all API routes**: Protected routes must use new JWT + RBAC middleware, public routes explicitly marked
5. **Add comprehensive test coverage**: Unit tests for JWT service, RBAC middleware, migration script, integration tests for full auth flow

This is a HIGH complexity task requiring changes across auth, middleware, routes, and schema layers.