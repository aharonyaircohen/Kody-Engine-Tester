
### taskify (2026-04-07T19:58:25)
{"task_type":"feature","title":"Add withCache wrapper function with TTL support","description":"Create withCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> in src/services/cache-wrapper.ts using in-memory Map with TTL expiry. The function wraps an async operation with caching - checking cache first, executing and caching on miss. Include comprehensive tests covering cache hits, misses, TTL expiry, and error handling.","scope":["src/services/cache-wrapper.ts","src/services/c
...(truncated)

### build (2026-04-07T20:07:29)
The implementation is complete. Here's a summary of what was created:

## Summary

**Created `src/services/cache-wrapper.ts`:**
- `withCache<T>(key, ttlMs, fn)` - wraps an async operation with TTL-based caching
- Uses in-memory Map with two entry types: `CacheEntry` (resolved values) and `PendingEntry` (in-flight promises)
- Handles concurrent requests by returning the same in-flight promise for duplicate keys
- Errors cause the cache entry to be deleted (no error caching)
- Exports `clearCache(
...(truncated)
