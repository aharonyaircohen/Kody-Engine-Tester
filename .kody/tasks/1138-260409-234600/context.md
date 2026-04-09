
### taskify (2026-04-09T23:48:33)
{
  "task_type": "feature",
  "title": "Add withCache wrapper in src/services/cache-wrapper.ts",
  "description": "Create a `withCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T>` higher-order function in `src/services/cache-wrapper.ts` that wraps async functions with in-memory Map-based caching with TTL expiry. Include co-located tests in `src/services/cache-wrapper.test.ts`.",
  "scope": ["src/services/cache-wrapper.ts", "src/services/cache-wrapper.test.ts"],
  "risk_level
...(truncated)

### plan (2026-04-09T23:48:58)
## Existing Patterns Found

- `src/utils/memoize.ts` — sync memoization HOC using `Map` for cache, co-located `.test.ts` with `vi.fn()` spies
- `src/utils/cache.ts` — Cache class with TTL expiry logic using `Date.now() > expiresAt` check on get
- `src/services/*.test.ts` — vitest pattern with `describe`/`it`/`expect`/`vi`/`beforeEach`/`afterEach`
- `src/utils/cache.test.ts` — uses `vi.useFakeTimers()` for TTL timing tests

## Plan

### Step 1: Write tests for `cache-wrapper`

**File:** `src/serv
...(truncated)

### build (2026-04-09T23:54:54)
Implementation complete. Here's a summary:

**Created files:**
- `src/services/cache-wrapper.ts` - implements `withCache<T>(key, ttlMs, fn)` with:
  - In-memory Map with TTL expiry
  - Request coalescing (concurrent calls share same pending promise)
  - Error handling (errors are not cached)
  - Exported `clearCache()` for testing

- `src/services/cache-wrapper.test.ts` - 12 tests covering:
  - Cache miss/hit behavior
  - TTL expiry
  - Request coalescing
  - Different keys (independent caches)

...(truncated)
