
### taskify (2026-04-09T22:48:53)
All 24 tests pass. Here's the task classification:

```json
{
  "task_type": "feature",
  "title": "Add HTTP method decorator middleware",
  "description": "Create a method-guard.ts middleware in src/middleware/ that restricts route handlers to specific HTTP methods (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS). The middleware accepts a list of allowed methods as configuration, returns 405 Method Not Allowed for disallowed methods, and includes an Allow header. A comprehensive test file with 24
...(truncated)

### build (2026-04-09T22:51:26)
The method-guard implementation is complete and verified:

**Summary:**
- `src/middleware/method-guard.ts` - 24 lines, implements HTTP method restriction middleware
- `src/middleware/method-guard.test.ts` - 24 tests covering allowed/disallowed methods, 405 responses, headers, and edge cases

**Implementation:**
- `createMethodGuard(config)` accepts `{ allowedMethods: HttpMethod[] }`
- Returns middleware that checks `request.method`
- Returns 405 with JSON body and `Allow` header for disallowed m
...(truncated)
