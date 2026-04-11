## Verdict: FAIL

## Summary

Metrics middleware (`src/middleware/metrics.ts`), tests (`src/middleware/metrics.test.ts`), and `/metrics` route (`src/app/api/metrics/route.ts`) are all implemented. Tests pass (24/24). However, the middleware is not wired into the Next.js request pipeline — there is no `middleware.ts` at the project root or anywhere that invokes `metrics.middleware`, so actual request tracking never happens.

## Findings

### Critical

None.

### Major

**`src/middleware/metrics.ts` — middleware not wired into Next.js** — The implementation creates and exports a singleton `metrics` with a `middleware` function, but no `middleware.ts` root file or other entry point invokes it on actual requests. The `/metrics` endpoint returns empty data (`{ totals: { requestCount: 0 }, routes: {} }`) because the middleware never runs. Per the plan's Step 4, the metrics middleware was supposed to be "wired into the Next.js pipeline" — this step is missing.

**`src/middleware/metrics.ts:131-141`** — `recordError` is the only path to populate `errors4xx`/`errors5xx`, but no caller invokes it automatically. In Next.js middleware, `NextResponse.next()` creates a passthrough — the actual response status code is determined by route handlers downstream, which the middleware cannot see. The error-counting API exists but requires manual external invocation; it is not integrated.

### Minor

**`src/middleware/metrics.ts:75`** — Two `.replace()` calls for collapsing `:id` segments are redundant with the per-segment normalization in the loop above them. The first replace `/\/:id\/:id/g` is for `/:id/:id` (two `:id` separated by `/`), the second `:id\/:id` is for `:id/:id` (two `:id` with `/` between). Both target the same pattern and could be a single replacement.

**`src/middleware/metrics.test.ts`** — No tests for `recordError` or `destroy`. Tests assert structure/serialization but not the actual error-counting behavior.

**`src/app/api/metrics/route.ts:1`** — `NextRequest` imported as a value instead of `import type`.

---

## Two-Pass Review

### Pass 1 — CRITICAL

### SQL & Data Safety
None.

### Race Conditions & Concurrency
**`src/middleware/metrics.ts:104`** — `buckets` Map mutated by `middleware()` while `cleanup()` iterates via `for...of`. Node.js single-threaded, but concurrent modification during iteration is technically unsafe.

### LLM Output Trust Boundary
Not applicable.

### Shell Injection
Not applicable.

### Enum & Value Completeness
Not applicable.

### Pass 2 — INFORMATIONAL

### Conditional Side Effects
**`src/middleware/metrics.ts:165-172`** — Latency measured as `performance.now()` delta between middleware entry and `NextResponse.next()`. Since `next()` does not wait for route handlers, this captures only middleware overhead, not end-to-end request latency.

### Test Gaps
- No test calls `metrics.recordError()` or verifies `errors4xx`/`errors5xx` increments.
- No test calls `metrics.destroy()`.
- No E2E or integration test that makes an actual HTTP request and verifies metrics are populated.

### Dead Code & Consistency
**`src/middleware/metrics.ts:75`** — Both `.replace()` calls collapse identical `:id/:id` patterns (one for leading slash context, one for general). Functionally one could suffice, though the redundancy is harmless.

### Performance & Bundle Impact
None.

### Type Coercion at Boundaries
None.
