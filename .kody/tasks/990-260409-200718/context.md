
### taskify (2026-04-09T20:09:38)

{
  "task_type": "refactor",
  "title": "Refactor auth system to use JWT with AuthService",
  "description": "Consolidate dual auth paths by replacing UserStore/SessionStore-based authentication with JWT+Payload AuthService. Update auth-middleware.ts to use AuthService instead of UserStore/SessionStore, refactor API routes in src/api/auth/ to consistently use AuthService, and remove deprecated in-memory stores. The Payload user schema already has correct RBAC roles (admin/editor/viewer).",
  "s
...(truncated)

### plan (2026-04-09T20:10:22)
## Existing Patterns Found

- **AuthService (Payload-based)**: `src/auth/auth-service.ts` - already implements JWT auth with Payload, uses `verifyAccessToken()` for token validation
- **withAuth HOC**: `src/auth/withAuth.ts` - already correctly uses `AuthService.verifyAccessToken()` instead of UserStore/SessionStore
- **JwtService**: `src/auth/jwt-service.ts` - custom HMAC-SHA256 JWT implementation with access/refresh token rotation
- **Payload Users collection**: `src/collections/Users.ts` - al
...(truncated)

### build (2026-04-09T20:17:43)
## Summary

I've completed the auth system refactoring according to the plan. Here's what was done:

### Changes Made

1. **`src/api/auth/login.ts`** - Replaced UserStore/SessionStore/JwtService-based login with AuthService:
   - Now accepts `AuthService` instead of `UserStore`, `SessionStore`, `JwtService`
   - Delegates to `authService.login()` internally

2. **`src/middleware/auth-middleware.ts`** - Refactored to use AuthService:
   - Now accepts `AuthService` instead of `UserStore`, `Session
...(truncated)
