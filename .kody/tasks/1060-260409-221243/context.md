
### taskify (2026-04-09T22:16:09)
All 7 tests pass. Here's the task classification:

```json
{
  "task_type": "feature",
  "title": "Add cache wrapper with TTL support",
  "description": "Created `withCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T>` in `src/services/cache-wrapper.ts` using an in-memory Map with TTL expiry. Includes 7 tests covering: basic return value, single invocation on cache hit, TTL expiration, different keys, cached value persistence, async function handling, and error propagation.",
...(truncated)

### build (2026-04-09T22:18:05)
**Verification complete.** The cache wrapper implementation is confirmed:

**`src/services/cache-wrapper.ts`** — 32 lines:
- `withCache<T>(key, ttlMs, fn)` — generic async cache wrapper using in-memory `Map`
- `CacheEntry<V>` interface with `value` and `expiresAt`
- Returns cached value if TTL not expired; otherwise calls `fn()`, caches result with new TTL
- `clearCache()` for test isolation

**`src/services/cache-wrapper.test.ts`** — 7 tests (all passing):
1. Returns the result of the function

...(truncated)
