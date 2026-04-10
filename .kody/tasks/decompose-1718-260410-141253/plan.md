Now I have enough context. Let me write the plan.

## Existing Patterns Found

- `src/utils/cache.ts` — existing `Cache<K, V>` class with TTL and LRU eviction; `memoryAdapter` should **delegate** to it rather than reimplement
- `src/utils/result.ts` — `Result<T, E>` discriminated union with `ok()`/`err()` helpers; all adapter methods should return `Result<V, Error>`
- `src/utils/di-container.ts` — `createToken<T>()` for type-safe DI tokens, `Container.register<T>()`, singleton lifecycle; `cacheManager` should use token-based adapter selection
- `src/middleware/rate-limiter.ts` — has a `// TODO: Replace in-memory store with Redis for multi-instance deployments` comment confirming Redis is a known future need

---

## Plan

### Step 1: Write tests for the memory adapter
**File:** `src/cache/memoryAdapter.test.ts`
**Change:** Create test file for `memoryAdapter` covering: `get` (cache hit/miss/expired), `set` (TTL, overwrite), `delete`, and error cases
**Why:** TDD — tests must exist before implementation
**Verify:** `pnpm test:int src/cache/memoryAdapter.test.ts` (fails until Step 2)

### Step 2: Write memory adapter
**File:** `src/cache/memoryAdapter.ts`
**Change:** Create adapter that wraps the existing `Cache` class from `src/utils/cache.ts`. Expose `get(key): Promise<Result<V, Error>>`, `set(key, value, ttl?): Promise<Result<void, Error>>`, `delete(key): Promise<Result<void, Error>>`. Use `tryCatch` from `src/utils/result.ts`
**Why:** Reuse existing `Cache` (TTL, LRU already implemented); adapter interface wraps it with Result return type
**Verify:** `pnpm test:int src/cache/memoryAdapter.test.ts` passes

### Step 3: Write tests for Redis adapter
**File:** `src/cache/redisAdapter.test.ts`
**Change:** Create test file with mocked `ioredis` (using `vi.fn()`). Cover `get`/`set`/`delete` methods returning `Result<V, Error>`, connection errors propagate as `Err`
**Why:** TDD — tests must exist before implementation
**Verify:** `pnpm test:int src/cache/redisAdapter.test.ts` (fails until Step 4)

### Step 4: Write Redis adapter
**File:** `src/cache/redisAdapter.ts`
**Change:** Create adapter using `ioredis`. `get`/`set`/`delete` all return `Promise<Result<V | void, Error>>`. TTL support via Redis `EX`/`PX` option on `set`
**Why:** Follows same adapter interface as memory adapter; Redis not currently in codebase so ioredis is the standard choice
**Verify:** `pnpm test:int src/cache/redisAdapter.test.ts` passes

### Step 5: Write cache manager
**File:** `src/cache/cacheManager.ts`
**Change:** Create `CacheManager` class with `createToken<CacheAdapter>()` for the adapter token. Accepts `{ adapter: 'memory' | 'redis', redisConfig?: RedisConfig }` in constructor. Registers the appropriate adapter via the DI container. Exposes `get`/`set`/`delete` delegating to the selected adapter
**Why:** Follows token-based DI pattern from `di-container.ts`; single place to select adapter strategy
**Verify:** `pnpm test:int src/cache/` passes

### Step 6: Write cache manager tests
**File:** `src/cache/cacheManager.test.ts`
**Change:** Test that cache manager selects memory adapter and Redis adapter correctly based on config
**Why:** TDD — tests must exist before implementation
**Verify:** `pnpm test:int src/cache/cacheManager.test.ts` passes
