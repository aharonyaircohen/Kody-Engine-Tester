
### taskify (2026-04-09T18:19:19)
{
  "task_type": "feature",
  "title": "Add Next.js middleware.ts for route protection",
  "description": "Create a Next.js middleware.ts at project root that uses the existing createAuthMiddleware to protect API routes via JWT validation. The middleware should: extract JWT from Authorization Bearer header, validate signature/expiration, reject unauthorized requests with 401, attach user info to request headers for downstream use, and support configurable protected route patterns with explicit e
...(truncated)

### plan (2026-04-09T18:20:44)
Now I have a clear picture. The existing `src/middleware/auth-middleware.ts` is an Express-style utility, not a Next.js App Router middleware. The task requires creating an actual `middleware.ts` at the project root.

Let me write the implementation plan.

## Existing Patterns Found

- **`src/auth/jwt-service.ts`**: `JwtService.verify()` validates JWT signature and expiration (stateless, works on edge)
- **`src/auth/_auth.ts`**: `extractBearerToken()` helper for parsing Bearer tokens
- **`src/mi
...(truncated)

### build (2026-04-09T18:23:18)
All 126 middleware tests pass. 

## Summary

I've created `middleware.ts` at the project root following the plan exactly. The implementation:

1. **Extracts JWT from Authorization Bearer header** using the existing `extractBearerToken` helper
2. **Validates token signature and expiration** via `JwtService.verify()` (stateless JWT validation)
3. **Returns 401 for invalid/missing tokens** on protected routes
4. **Attaches user info** (`x-user-id`, `x-user-email`, `x-user-role`) to request headers 
...(truncated)
