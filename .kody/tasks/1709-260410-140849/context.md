
### taskify (2026-04-10T14:12:45)
Done. Created:

**`src/middleware/timestamp-middleware.ts`** - Middleware that adds `x-timestamp` header with Unix timestamp to all requests, following the factory pattern used by other middleware in the project.

**`src/middleware/timestamp-middleware.test.ts`** - 13 comprehensive tests covering:
- Normal request handling
- Custom header name configuration
- `next()` chain continuation
- Various HTTP methods and paths
- Query parameters
- Timestamp correctness and uniqueness over time


### build (2026-04-10T14:14:23)
All **13 tests pass**. The implementation is complete and verified:

**Summary:**
- `src/middleware/timestamp-middleware.ts` - Middleware factory that adds `x-timestamp` header with Unix timestamp
- `src/middleware/timestamp-middleware.test.ts` - 13 comprehensive tests covering:
  - Normal request handling
  - Custom header name configuration  
  - `next()` chain continuation
  - Various HTTP methods and paths
  - Query parameters
  - Error cases (empty body, custom headers, POST requests)

**Ac
...(truncated)
