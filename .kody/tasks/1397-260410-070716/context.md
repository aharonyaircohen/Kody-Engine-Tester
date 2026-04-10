
### taskify (2026-04-10T07:10:26)
```json
{
  "task_type": "feature",
  "title": "Add withCache wrapper function",
  "description": "Create `withCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T>` in `src/services/cache-wrapper.ts` using in-memory Map with TTL expiry. The wrapper should check cache first, return cached value if valid, otherwise call the function and cache the result. Include tests in `src/services/cache-wrapper.test.ts`.",
  "scope": ["src/services/cache-wrapper.ts", "src/services/cache-wrapp
...(truncated)

### build (2026-04-10T07:13:35)
Implementation complete. Here's a summary:

**Created files:**

1. **`src/services/cache-wrapper.ts`** - `withCache<T>(key, ttlMs, fn)` function that:
   - Uses an in-memory Map with TTL expiry
   - Returns cached value if valid, otherwise calls the function and caches the result
   - Refreshes TTL on each cache hit
   - Exports `clearCache()` for testing

2. **`src/services/cache-wrapper.test.ts`** - 8 tests covering:
   - Returns result when cache is empty
   - Returns cached value within TTL

...(truncated)
