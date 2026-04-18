
### taskify (2026-04-18T21:49:27)
{
  "task_type": "feature",
  "title": "Add /api/healthz GET endpoint returning { status: 'ok' }",
  "description": "Create a minimal Next.js route handler at src/app/api/healthz/route.ts that exports a GET function returning a JSON Response with { status: 'ok' } and HTTP 200. No middleware, no auth, no additional fields. Reuse the existing API route pattern from src/app/api/health/route.ts (NextRequest → Response with JSON.stringify and Content-Type header).",
  "scope": ["src/app/api/healthz/r
...(truncated)

### build (2026-04-18T21:51:23)
The test failure is a pre-existing database connectivity issue in `tests/int/api.int.spec.ts` (PostgreSQL query parameter error) — unrelated to my changes. The new `healthz` route has zero type errors and follows the established pattern exactly.

Here's what was created:

**`src/app/api/healthz/route.ts`** — a minimal GET handler that:
- Imports `NextRequest` from `next/server` (matching the existing pattern)
- Exports a `GET` function returning `Response` with `JSON.stringify({ status: 'ok' })`
...(truncated)
