

## Verdict: PASS

## Summary

Two new files (`src/middleware/rateLimit.ts`, `src/middleware/rateLimit.test.ts`) implement a fixed-window IP rate limiter and middleware factory following the established factory-pattern conventions. `src/middleware/rate-limiter.ts` received minor improvements (bugfix in `setRateLimitHeaders`, enhanced comment, new `byApiKey` helper). No blocking issues.

## Findings

### Critical

None.

### Major

None.

### Minor

- `src/middleware/rate-limiter.ts:106` — New `byApiKey` export added in the same diff but not covered by any test. Verify whether it's intentionally untested or if a test was missed.
- `src/middleware/rateLimit.ts:112` — `X-RateLimit-Reset` header uses `(Date.now() + retryAfterMs) / 1000` — this is an absolute Unix timestamp that drifts forward as long as `retryAfterMs > 0`. This matches the existing `rate-limiter.ts` pattern, so consistency is maintained, but it means `X-RateLimit-Reset` changes value on every call within the same window. If consumers read it once and cache it, they'll get a stale expiration. Consider noting this in docs or using the window's absolute expiry time (`entry.windowStart + windowMs`) for deterministic values.
- `.gitignore:54` — Glob pattern `.kody/graph/.graph-lock.lock/` creates a directory pattern with trailing slash inside a glob context — may not be intended (standard gitignore uses file patterns or `*/` for directories).

## Two-Pass Review

**Pass 1 — CRITICAL:**

### SQL & Data Safety

None — no database operations.

### Race Conditions & Concurrency

None — in-memory Map with no concurrent access in a single-process Node.js environment.

### LLM Output Trust Boundary

None — no LLM output.

### Shell Injection

None.

### Enum & Value Completeness

None — no enums introduced.

---

**Pass 2 — INFORMATIONAL:**

### Conditional Side Effects

None.

### Test Gaps

`src/middleware/rate-limiter.ts:106` — `byApiKey` function added in the same diff but no test covers it. Also, `rate-limiter.test.ts` covers `byIp` indirectly via the middleware but neither test file exercises `byApiKey` as a standalone export.

### Dead Code & Consistency

None.

### Crypto & Entropy

None.

### Performance & Bundle Impact

None.

### Type Coercion at Boundaries

None.

---

## Notes

- The prior stage's review (FAIL) identified blacklist/whitelist precedence and `X-RateLimit-Reset` timestamp bugs — both are confirmed fixed in this diff. The whitelist check (line 127) now correctly runs before the blacklist check (line 134), matching `rate-limiter.ts` precedence. The Reset header now uses `(Date.now() + retryAfterMs) / 1000` with `Math.ceil`.
- `rate-limiter.ts` changes (bugfix on `setRateLimitHeaders` line 120, comment clarification line 134, `byApiKey` export lines 106-108) are correct and follow existing patterns.
- `.kody/` metadata files and skill doc updates are infrastructure and documentation — out of scope for code review.