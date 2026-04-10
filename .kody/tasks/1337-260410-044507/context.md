
### taskify (2026-04-10T04:56:43)
Based on my exploration, the auth middleware already exists and is fully implemented:

**Existing Implementation:**
- `src/middleware/auth-middleware.ts` - Factory function `createAuthMiddleware` that extracts JWT from Bearer token, verifies it, checks sessions, and returns 401 for invalid/missing tokens
- `src/middleware/auth-middleware.test.ts` - Comprehensive tests covering valid tokens, missing tokens, invalid tokens, expired tokens, revoked sessions, and rate limiting
- `src/auth/withAuth.t
...(truncated)

### plan (2026-04-10T05:02:52)
The auth middleware implementation is complete and verified:

## Pattern Discovery Report

**Existing Patterns Found:**
- `src/middleware/auth-middleware.ts:createAuthMiddleware` - Factory function using Bearer JWT extraction via `extractBearerToken`, JWT verification via `JwtService`, session validation via `SessionStore`, returns 401 for invalid/missing tokens, attaches user/session to context
- `src/auth/withAuth.ts` - HOC wrapping Next.js route handlers with JWT authentication and RBAC role 
...(truncated)

### build (2026-04-10T05:03:33)
The auth middleware is **fully implemented and verified**:

## Summary

**Auth Middleware Implementation** (`src/middleware/auth-middleware.ts`):
- Extracts JWT from Bearer token in Authorization header (line 50-54)
- Verifies token via `JwtService` (line 58)
- Validates session via `SessionStore` (line 64)
- Returns 401 for missing/invalid/expired/revoked tokens (lines 51, 61, 66, 70, 75)
- Attaches decoded user to request context (line 78)
- Includes rate limiting (100 requests/minute)

**Prot
...(truncated)
