## Existing Patterns Found

- `src/utils/memoize.ts` — sync memoization HOC using `Map` for cache, co-located `.test.ts` with `vi.fn()` spies
- `src/utils/cache.ts` — Cache class with TTL expiry logic using `Date.now() > expiresAt` check on get
- `src/services/*.test.ts` — vitest pattern with `describe`/`it`/`expect`/`vi`/`beforeEach`/`afterEach`
- `src/utils/cache.test.ts` — uses `vi.useFakeTimers()` for TTL timing tests

## Plan

### Step 1: Write tests for `cache-wrapper`

**File:** `src/services/cache-wrapper.test.ts`
**Change:** Create test file with:
- Cache miss: fn called once, second call returns cached
- TTL expiry: after ttlMs, fn called again
- Cache hit: fn called only once across multiple invocations
- Concurrent calls: while fn is pending, all waiters share same promise (request coalescing)
- Different keys: independent caches
- Error handling: errors are not cached (fn called again after error)

**Verify:** `pnpm test:int -- src/services/cache-wrapper.test.ts`

---

### Step 2: Implement `cache-wrapper.ts`

**File:** `src/services/cache-wrapper.ts`
**Change:** Create `withCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T>` using an in-memory `Map<string, { value: T; expiresAt: number }>`. On cache miss or expiry, call fn and store result. Use request coalescing — if a cache entry has a pending promise, return that same promise rather than calling fn multiple times.

```typescript
interface CacheEntry<T> {
  value: T
  expiresAt: number
}

const cache = new Map<string, CacheEntry<unknown> | Promise<unknown>>()

export async function withCache<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>
): Promise<T> {
  const now = Date.now()
  const entry = cache.get(key)

  if (entry && !(entry instanceof Promise)) {
    if (entry.expiresAt > now) {
      return entry.value as T
    }
    cache.delete(key)
  }

  if (entry instanceof Promise) {
    return entry as Promise<T>
  }

  const promise = fn().then((value) => {
    cache.set(key, { value, expiresAt: Date.now() + ttlMs })
    return value
  })

  cache.set(key, promise)
  return promise
}
```

**Verify:** `pnpm test:int -- src/services/cache-wrapper.test.ts`

---

### Step 3: Run full test suite

**File:** `vitest.config.mts`
**Change:** None
**Verify:** `pnpm test:int`

---

## Questions

None — the requirements are clear and existing patterns fully cover the approach.
