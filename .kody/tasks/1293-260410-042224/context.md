
### taskify (2026-04-10T04:25:46)
Created `src/services/cache-wrapper.ts` with `withCache<T>(key, ttlMs, fn)` using the existing `Cache` class from `src/utils/cache.ts`, plus `src/services/cache-wrapper.test.ts` with 6 tests (all passing).

**Summary:**
- **task_type**: feature
- **title**: Add cache wrapper
- **description**: Created `withCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T>` in `src/services/cache-wrapper.ts` using the existing `Cache` utility with in-memory Map and TTL expiry. Added 6 tests c
...(truncated)

### build (2026-04-10T04:27:55)
## Verification Summary

**Implementation Status: Complete and Working**

### Files Verified
| File | Status |
|------|--------|
| `src/services/cache-wrapper.ts` | ✅ Implemented |
| `src/services/cache-wrapper.test.ts` | ✅ 6 tests passing |
| `src/utils/cache.ts` | ✅ Cache utility with TTL expiry |

### Implementation Details

**`withCache<T>(key, ttlMs, fn)`** in `src/services/cache-wrapper.ts`:
- Uses existing `Cache` class from `src/utils/cache.ts` (in-memory Map with TTL + LRU eviction)
- R
...(truncated)
