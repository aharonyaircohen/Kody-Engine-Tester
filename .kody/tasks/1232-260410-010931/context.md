
### taskify (2026-04-10T01:12:10)
{
  "task_type": "feature",
  "title": "Add withCache wrapper function",
  "description": "Create `withCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T>` in `src/services/cache-wrapper.ts` using in-memory Map with TTL expiry. The wrapper should cache async function results and return cached values within the TTL window. Include co-located tests in `cache-wrapper.test.ts`.",
  "scope": [
    "src/services/cache-wrapper.ts",
    "src/services/cache-wrapper.test.ts"
  ],
  "ris
...(truncated)

### build (2026-04-10T01:14:18)
Implementation complete. Both files were created:

- `src/services/cache-wrapper.ts` - Contains `withCache<T>()` function using an in-memory Map with TTL expiry, plus `clearCache()` for testing
- `src/services/cache-wrapper.test.ts` - 8 tests covering cache hits, TTL expiry, null/undefined values, different keys, rejected promises, and cache clearing

All 8 tests pass and TypeScript compiles without errors.

