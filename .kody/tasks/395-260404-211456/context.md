
### taskify (2026-04-04T21:40:32)
```json
{
  "task_type": "feature",
  "title": "Redesign auth: JWT refresh, OAuth2 PKCE, multi-tenant RBAC, user schema migration",
  "description": "Complete authentication system redesign to add: (1) OAuth2 PKCE flow for Google/GitHub providers, (2) Multi-tenant RBAC with per-tenant admin/editor/viewer/guest roles, (3) User schema migration with tenantId, roles array, oauthProviders fields, (4) Per-tenant rate limiting, (5) Comprehensive auth flow tests. Note: JWT access/refresh tokens, token 
...(truncated)

### plan (2026-04-04T21:42:10)
The plan has been written to `.kody/tasks/395-260404-211456/plan.md`. The task is a **high-risk, multi-file feature** that adds OAuth2 PKCE, multi-tenant RBAC, and user schema migration on top of an existing auth foundation that already has JWT refresh tokens and a `withAuth` HOC.


### build (2026-04-04T21:56:50)
## Summary

I've implemented the complete authentication system redesign with the following changes:

### 1. Users Collection Schema (`src/collections/Users.ts`)
- Added `tenantId` field for multi-tenant identification
- Added `roles` array field for per-tenant RBAC (admin/editor/viewer/guest)
- Added `oauthProviders` array field for OAuth2 provider connections

### 2. JWT Service (`src/auth/jwt-service.ts`)
- Added `TenantRole` interface with `tenantId` and `role` properties
- Updated `TokenPay
...(truncated)
