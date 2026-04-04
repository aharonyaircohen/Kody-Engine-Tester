# [test-suite] Redesign entire auth: JWT refresh tokens, OAuth2 PKCE, multi-tenant RBAC, and user schema migration

Complete authentication system redesign:

1. Replace session-based auth with JWT access + refresh token flow in src/auth/
2. Implement OAuth2 PKCE flow for third-party providers (Google, GitHub)
3. Add multi-tenant RBAC with admin/editor/viewer/guest roles per tenant
4. Migrate user schema: add tenantId, roles array, refreshTokenHash, oauthProviders fields
5. Update ALL existing API routes to use the new RBAC middleware
6. Add token rotation, revocation list, and rate limiting per tenant
7. Add comprehensive tests for all auth flows including edge cases (expired tokens, revoked sessions, cross-tenant access)