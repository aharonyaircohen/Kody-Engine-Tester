
### taskify (2026-04-10T01:54:59)
{"task_type":"refactor","title":"Redesign auth system with JWT RS256 and RBAC","description":"Migrate from session-based auth and HS256 JWT to RS256-signed JWT tokens with proper RBAC (admin/editor/viewer). Requires: upgrading jwt-service.ts from HS256 to RS256, aligning user-store.ts roles with RbacRole, adding tokenVersion-based revocation, updating auth-service.ts, refreshing middleware, and comprehensive test coverage for all new functionality. The existing implementation has HS256-based JWT
...(truncated)

### plan (2026-04-10T01:56:24)
Based on my exploration, I can see the existing implementation has HS256-based JWT, dual role systems (`UserRole` vs `RbacRole`), and session-store usage. Let me create the plan.

## Existing Patterns Found
- `src/auth/jwt-service.ts` - JwtService class with `sign`/`verify` methods, blacklist-based revocation, generation-based token rotation — **to be upgraded from HS256 to RS256**
- `src/auth/auth-service.ts` - AuthService with login/refresh/verifyAccessToken/logout using Payload SDK, PBKDF2 pa
...(truncated)

### build (2026-04-10T02:18:13)
## Summary

I've successfully implemented the auth system redesign with JWT RS256 and RBAC. Here are the changes made:

### Files Modified

1. **`src/auth/jwt-service.ts`** - Upgraded from HS256 (symmetric) to RS256 (asymmetric) signing
   - Now requires RSA key pairs (private/public PEM keys)
   - Removed blacklist mechanism (replaced by tokenVersion-based revocation)

2. **`src/auth/user-store.ts`** - Aligned with RbacRole
   - Changed `UserRole` from `'admin' | 'user' | 'guest' | 'student' | 
...(truncated)
