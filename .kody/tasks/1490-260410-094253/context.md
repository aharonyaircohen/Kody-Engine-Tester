
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

### review (2026-04-10T10:32:25)
## Verdict: PASS

## Summary

The JWT v2 RS256 service and RBAC middleware implementation adds asymmetric key-based JWT signing alongside the existing HS256 service, with a migration mode supporting both during transition. The implementation follows the existing patterns in the codebase and all auth tests pass. The pre-existing build failure (`src/pages/board/modal`) is unrelated to these changes.

## Findings

### Critical

None.

### Major

None.

### Minor

**`src/auth/jwt-v2.ts:170`** — `ver
...(truncated)

### review-fix (2026-04-10T10:32:51)

The review report shows:

**Verdict: PASS**

## Summary

- **Critical**: None
- **Major**: None  
- **Minor**: 2 findings (ignored per instructions to fix only Critical/Major)

The Minor findings were:
1. `jwt-v2.ts:170` — `verify()` reads `_blacklist` without ensuring initialization
2. `_auth.ts:96` — `verifyToken` casts v1 verify result to `TokenPayload` without type check

Since the review found **no Critical or Major issues**, there are no required fixes based on the review criteria. The im
...(truncated)
