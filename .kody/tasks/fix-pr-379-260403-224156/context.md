
### build (2026-04-03T22:49:23)
All 31 middleware tests pass. Here's a summary of the fixes:

## Summary

### Implementation Fix (`src/middleware/cors-middleware.ts`)

1. **`buildCorsHeaders`** (non-preflight): When `supportsCredentials` is `true`, the middleware now uses the specific origin instead of wildcard, and sets `Access-Control-Allow-Credentials: true`.

2. **Preflight handler** (OPTIONS): When `supportsCredentials && origin`, the middleware now uses the specific origin and sets credentials header, overriding any wild
...(truncated)
