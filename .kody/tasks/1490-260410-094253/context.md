
### taskify (2026-04-10T10:08:52)
{"task_type":"refactor","title":"Add JWT v2 RS256 service with RBAC middleware","description":"Redesign authentication system by adding JWT v2 service using RS256 signing algorithm, adding RBAC middleware for admin/editor/viewer role gating with hierarchical inheritance, and updating _auth.ts to support both legacy and new auth modes during 30-day migration. New jwt-v2.ts uses RSA key pairs instead of HMAC secrets. RBAC middleware extends existing role-guard pattern. All changes must be backward
...(truncated)

### plan (2026-04-10T10:10:07)
## Existing Patterns Found

- **JwtService HS256**: `src/auth/jwt-service.ts` uses Web Crypto API (`crypto.subtle.importKey`, `HMAC`, `SHA-256`) with same `TokenPayload` shape (`userId, email, role, sessionId, generation, iat, exp`). Methods: `signAccessToken` (15min), `signRefreshToken` (7 days), `blacklist`, `cleanupBlacklist`.
- **Role guard HOF**: `src/middleware/role-guard.ts` — `requireRole(...roles)` returns function `(context: RoleContext) => error | undefined` using `ROLE_HIERARCHY` fro
...(truncated)

### build (2026-04-10T10:26:14)
## Implementation Complete

I've successfully implemented the JWT v2 RS256 service with RBAC middleware. Here's a summary:

### Files Created

1. **`src/auth/jwt-v2.ts`** - New RS256 JWT service using RSA-PKCS1-v1_5 with SHA-256 via Web Crypto API
   - Same `TokenPayload` interface as v1 for compatibility
   - `signAccessToken` (15 min), `signRefreshToken` (7 days), `blacklist`, `cleanupBlacklist`
   - `isRs256Token()` helper to detect RS256 tokens
   - Module-level singleton `getJwtServiceV2()`
...(truncated)
