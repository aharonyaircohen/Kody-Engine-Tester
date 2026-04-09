
### taskify (2026-04-09T17:15:05)
All 9 tests pass.

```json
{
  "task_type": "feature",
  "title": "Add cache wrapper with TTL expiry",
  "description": "Create withCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> in src/services/cache-wrapper.ts using an in-memory Map with TTL expiry. Includes clearCache helper for manual invalidation. All 9 tests covering cache hits, misses, TTL expiry, multi-key isolation, and clearCache behavior pass.",
  "scope": ["src/services/cache-wrapper.ts", "src/services/cache-w
...(truncated)

### build (2026-04-09T17:16:28)
All 9 tests pass. The implementation is verified:

**`src/services/cache-wrapper.ts`** — `withCache<T>` function using in-memory `Map` with TTL expiry, plus `clearCache(key?)` for cache management.

**`src/services/cache-wrapper.test.ts`** — 9 tests covering:
- First call caching
- Cache hit within TTL (fn called once)
- Different keys produce different cached values
- TTL expiry triggers re-computation
- Object and array result types
- `clearCache(key)` for specific key
- `clearCache()` clears 
...(truncated)
