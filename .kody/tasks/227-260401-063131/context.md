
### taskify (2026-04-01T06:42:16)
All tasks completed successfully. Here's a summary of what was created:

**Created files:**

1. **`src/middleware/correlation-id.ts`** - Correlation ID middleware that:
   - Generates UUID v4 correlation IDs using `crypto.randomUUID()`
   - Attaches them to response headers (`X-Correlation-ID`)
   - Reuses existing correlation IDs from incoming headers
   - Supports custom header names and generators

2. **`src/middleware/request-logger.ts`** - Request logger middleware that:
   - Logs request m
...(truncated)

### build (2026-04-01T06:45:09)
The middleware implementation is complete and all tests pass. Here's a summary:

**`src/middleware/correlation-id.ts`** - Correlation ID middleware that:
- Generates UUID v4 using `crypto.randomUUID()`
- Attaches ID to `X-Correlation-ID` response header
- Reuses existing correlation IDs from incoming headers (case-insensitive)
- Supports custom header names and custom ID generators

**`src/middleware/correlation-id.test.ts`** - 15 tests covering:
- UUID v4 format validation, uniqueness
- Header 
...(truncated)
