
### taskify (2026-04-10T08:00:48)
{"task_type":"chore","title":"Verify auth middleware implementation for route protection","description":"The auth middleware and route protection is already implemented. Verification needed: 1) Auth middleware exists in src/middleware/auth-middleware.ts with JWT verification from Bearer token, 2) Unit tests exist in src/middleware/auth-middleware.test.ts covering valid token, missing token (401), invalid token (currently 401 but AC says 403), expired token (currently 401 but AC says 403), 3) Rou
...(truncated)

### build (2026-04-10T08:04:08)
All the routes mentioned in the task are protected with `withAuth`. Here's a summary of the changes made:

## Summary

**Issue Fixed:** The acceptance criteria specified that invalid/expired tokens should return **403**, but the middleware was returning **401** for those cases.

**Changes Made:**

1. **`src/middleware/auth-middleware.ts`** - Updated status codes from 401 → 403 for:
   - Invalid token verification failure
   - Session not found or expired
   - Token superseded by newer session
  
...(truncated)
