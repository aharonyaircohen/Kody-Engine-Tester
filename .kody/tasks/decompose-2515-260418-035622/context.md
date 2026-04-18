
### taskify (2026-04-18T04:10:16)
The plan is ready for your review. Here's a summary of what it covers:

**5 files to create:**
1. `src/cache/cacheAdapter.ts` — shared `CacheAdapter` interface + config types
2. `src/cache/redisAdapter.ts` — imports `ioredis` (not installed → throws at import time, triggering fallback)
3. `src/cache/memoryAdapter.ts` — wraps existing `Cache` class from `src/utils/cache.ts`
4. `src/cache/cacheManager.ts` — adapter selector using dynamic import + `Result<T, E>` from `src/utils/result.ts`
5. `src/m
...(truncated)

### build (2026-04-18T04:11:58)
The plan is ready for your review. Here's a summary of what it covers:

**5 files to create:**

1. **`src/cache/cacheAdapter.ts`** — shared `CacheAdapter` interface + `CacheAdapterConfig` type
2. **`src/cache/memoryAdapter.ts`** — wraps the existing `Cache<string, string>` from `src/utils/cache.ts`; no external deps
3. **`src/cache/redisAdapter.ts`** — **statically** imports `ioredis` → throws `MODULE_NOT_FOUND` at import time (triggering fallback in the cache manager)
4. **`src/cache/cacheManag
...(truncated)
