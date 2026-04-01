# [test-suite] Refactor auth system with migration

Redesign the entire authentication system: replace session-based auth with JWT tokens, migrate the user schema to add token fields, implement RBAC with admin/editor/viewer roles, update all API routes to use the new auth middleware, and add comprehensive tests.