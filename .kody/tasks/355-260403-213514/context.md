
### build (2026-04-03T22:25:55)
All 118 middleware tests pass. Here's a summary of what was created:

## Summary

**Created `src/middleware/cors-middleware.ts`** with:
- Configurable `allowedOrigins` (array or function predicate)
- Configurable `allowedMethods` (defaults to standard HTTP methods)
- Configurable `allowedHeaders` (defaults to common headers)
- `exposedHeaders` support
- `supportsCredentials` with proper wildcard handling (credentials not sent with `*` origin per CORS spec)
- `maxAge` for preflight caching
- Pref
...(truncated)
