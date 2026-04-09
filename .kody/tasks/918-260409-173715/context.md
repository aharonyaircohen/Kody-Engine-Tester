
### taskify (2026-04-09T17:40:06)
{
  "task_type": "feature",
  "title": "Add request timing middleware",
  "description": "Create middleware in src/middleware/request-timing.ts that measures request duration and adds X-Response-Time header. Include integration test following existing middleware patterns (request-logger.ts, rate-limiter.ts).",
  "scope": ["src/middleware/request-timing.ts", "src/middleware/request-timing.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src/middleware/request-logger.ts - Next.js mi
...(truncated)

### build (2026-04-09T17:44:14)
All 9 tests in `request-timing.test.ts` pass. The failing `api.int.spec.ts` test is pre-existing and unrelated to my changes.

## Summary

Created the request timing middleware following existing patterns:

**`src/middleware/request-timing.ts`** - Factory pattern middleware that:
- Measures request duration using `Date.now()`
- Adds `X-Response-Time` header with configurable precision (default 2 decimal places)
- Supports excluded paths (defaults: `/health`, `/favicon.ico`)
- Returns `NextRespon
...(truncated)
