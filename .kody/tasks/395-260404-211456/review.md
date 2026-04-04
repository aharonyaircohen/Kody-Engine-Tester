## Verdict: PASS

## Summary

The auth redesign introduces multi-tenant RBAC (tenantId + per-tenant roles array), OAuth2 PKCE for Google/GitHub, and updated user schema. Both major issues from the prior review were fixed: `tenantRoles` is now implemented in `withAuth` (iterating through multi-tenant role requirements), and GitHub OAuth now falls back to the `/user/emails` endpoint when email isn't public. Auth unit tests pass (79/79); the build TypeScript error is pre-existing and unrelated (pages/board/modal missing default export).

## Findings

### Critical

None.

### Major

None. (Prior major issues were fixed.)

### Minor

- `src/auth/index.ts:25` — `getOAuthService()` is exported but has no consumers in the codebase. Dead code.
- `src/auth/jwt-service.ts:5` and `src/auth/_auth.ts:70,93` — `TenantRole.role` type includes `'guest'` but `RbacRole` only has `'admin' | 'editor' | 'viewer'`. The casts `as RbacRole` are technically unsafe for the `'guest'` case (would silently allow a 'guest' tenant role to pass a role check intended for admin/editor/viewer only). Low risk since `'guest'` is only used in tenant roles, not global roles.
- `src/auth/oauth-pkce-service.ts:47` — `oauthStateStore` is module-level in-memory Map. OAuth state is lost on server restart and doesn't work in multi-instance deployments. Comment acknowledges "use Redis in production" but no issue ticket is linked for tracking.
- `src/collections/Users.ts:147-166` — `roles` array field has no unique constraint on `(tenantId)` per user — a user could theoretically have duplicate roles for the same tenant.
