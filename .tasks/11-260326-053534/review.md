All 13 tests pass. Here's my review:

## Verdict: PASS

## Summary
A sliding window rate limiter middleware with per-IP and per-API-key support, implemented cleanly with comprehensive tests. The only uncommitted change is a type-safety fix for `request.ip`.

## Findings

### Critical
None.

### Major
None.

### Minor

1. **Unbounded timestamp array growth** (`rate-limiter.ts:42`) — The `active` array grows with each allowed request. Under sustained high traffic from a single key, the array could become large before cleanup runs. Not a practical issue for typical rate limits (e.g. 100 req/min) but worth noting.

2. **`request.ip` type cast** (`rate-limiter.ts:97`) — The `(request as unknown as { ip?: string }).ip` cast is a reasonable workaround for the Next.js type not exposing `.ip` in all contexts, but it's a bit ugly. The uncommitted change fixes a build error, which is correct.

3. **`retryAfterMs` could be slightly negative in edge case** (`rate-limiter.ts:52`) — If the oldest timestamp is exactly at `windowStart` (i.e., `ts > windowStart` is false and it gets filtered out), then `active[0]` would be a newer timestamp, so this is actually fine. The `>` strict comparison on line 39 is correct.

## Review checklist
- [x] Does the code match the plan?
- [x] Are edge cases handled?
- [x] Are there security concerns? — No. Null key bypass is intentional (line 113).
- [x] Are tests adequate? — 13 tests covering all specified scenarios.
- [x] Is error handling proper?
- [x] Are there any hardcoded values that should be configurable? — `cleanupIntervalMs` and `message` are configurable with sensible defaults.
