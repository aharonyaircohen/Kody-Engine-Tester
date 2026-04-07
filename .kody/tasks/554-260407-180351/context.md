
### taskify (2026-04-07T18:06:23)
{
  "task_type": "feature",
  "title": "Add CORS middleware with tests",
  "description": "Create `src/middleware/cors-middleware.ts` with a `createCorsMiddleware` factory that handles Cross-Origin Resource Sharing. Config interface should include `origin` (allowed origins array), `methods` (allowed HTTP methods), and `credentials` (allow credentials flag). Export both the middleware factory and a default config. Write `src/middleware/cors-middleware.test.ts` with comprehensive tests covering al
...(truncated)

### build (2026-04-07T18:10:02)
The implementation is complete. Here's what was created:

**`src/middleware/cors-middleware.ts`**
- `CorsMiddlewareConfig` interface with `origin`, `methods`, and `credentials` options
- `createCorsMiddleware` factory function returning a middleware
- Helper functions: `isOriginAllowed`, `buildCorsHeaders`
- Default config exported (`DEFAULT_CORS_CONFIG`)
- Supports wildcard `*` origin
- Handles OPTIONS preflight requests with 204 + CORS headers
- Handles actual requests by adding CORS headers w
...(truncated)
