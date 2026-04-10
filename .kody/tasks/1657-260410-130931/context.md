
### taskify (2026-04-10T13:13:34)
All 33 tests pass. Here's a summary of what was created:

**`src/middleware/cors-middleware.ts`** - CORS middleware factory:
- `createCorsMiddleware(options)` factory accepting `origin`, `methods`, `allowedHeaders`, `exposedHeaders`, `credentials`, and `maxAge`
- Returns a middleware function `(request: NextRequest) => NextResponse`
- Handles origin matching (specific string, boolean true/false, array of origins)
- Sets `Vary: Origin` header to prevent caching issues

**`src/middleware/cors-midd
...(truncated)

### build (2026-04-10T13:15:11)
The CORS middleware implementation is complete and all 33 tests pass. The implementation meets all acceptance criteria:

- **`createCorsMiddleware` factory** accepting `CorsOptions` with `origin`, `methods`, `allowedHeaders`, `exposedHeaders`, `credentials`, and `maxAge`
- **Middleware function** `(request: NextRequest) => NextResponse` compatible with the existing middleware interface
- **33 unit tests** covering all options and edge cases including:
  - Origin matching (string, boolean true/fa
...(truncated)
