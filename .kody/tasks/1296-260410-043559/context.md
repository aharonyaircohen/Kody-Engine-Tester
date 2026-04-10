
### taskify (2026-04-10T04:38:27)
{"task_type":"feature","title":"Add request timing middleware","description":"Create middleware in `src/middleware/request-timing.ts` that measures request duration and adds `X-Response-Time` header with duration in milliseconds. Include co-located integration test in `request-timing.test.ts`.","scope":["src/middleware/request-timing.ts","src/middleware/request-timing.test.ts"],"risk_level":"low","existing_patterns":["src/middleware/request-logger.ts — NextRequest/NextResponse middleware factory
...(truncated)

### build (2026-04-10T04:40:50)
Implementation complete. Here's a summary:

**Created files:**

1. **`src/middleware/request-timing.ts`** - Middleware factory that:
   - Measures request duration using `Date.now()`
   - Adds `X-Response-Time` header with duration in milliseconds
   - Supports `excludePaths` configuration (default: `['/health', '/favicon.ico']`)
   - Follows the same `NextRequest → NextResponse` pattern as `request-logger.ts`

2. **`src/middleware/request-timing.test.ts`** - 9 integration tests covering:
   - A
...(truncated)
