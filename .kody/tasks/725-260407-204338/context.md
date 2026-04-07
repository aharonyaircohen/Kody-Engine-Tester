
### taskify (2026-04-07T20:46:08)
{
  "task_type": "feature",
  "title": "Add cache wrapper function",
  "description": "Create `withCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T>` in `src/services/cache-wrapper.ts` using an in-memory Map with TTL expiry. The function should check the cache first, return cached value if not expired, otherwise call the function and cache its result. Include co-located tests in `src/services/cache-wrapper.test.ts`.",
  "scope": [
    "src/services/cache-wrapper.ts",
    "sr
...(truncated)

### build (2026-04-07T20:47:36)
Implementation complete. Created:

- **`src/services/cache-wrapper.ts`** - `withCache<T>(key, ttlMs, fn)` function using in-memory Map with TTL expiry, plus `clearCache()` helper
- **`src/services/cache-wrapper.test.ts`** - 10 tests covering cache hit/miss, TTL expiry, null/undefined caching, error handling, and cache clearing

All 10 tests pass.

