# Review-Fix Plan: P3T30 Cache System

## Issues Found

### Critical 1: `src/cache/redisAdapter.ts` line 6 — `typeof import('ioredis')` causes TS error
TypeScript resolves `typeof import('ioredis')` at compile time regardless of the runtime `tryCatch`. Since `ioredis` is not installed, TS emits `error TS2307: Cannot find module 'ioredis'`.

**Fix**: Replace `type IORedis = typeof import('ioredis')` and `IORedis['Redis']` with inline interfaces that describe the Redis client contract. No top-level type import of `ioredis`.

### Critical 2: `src/cache/cacheManager.test.ts` — mock returns plain object instead of Result instance
The `vi.mock` for `createRedisAdapter` returns `{ ok: false, error: new Error(...) }` — a plain object. `CacheManager` calls `redisResult.isOk()` which is `undefined` on a plain object.

**Fix**: Import `Err` from `@/utils/result` and return `new Err(new Error('ioredis not found'))` in the mock.

### Minor: `src/cache/cacheManager.ts` uses `.isOk()` method
The existing `Result` class supports both `.isOk()` method and `.ok` property (via duck typing). Switch to `.ok` property for cleaner duck-typed access — aligns with the plain-object mock shape.

## Changes

### 1. `src/cache/redisAdapter.ts`
Replace line 6 and references to `IORedis` with inline interfaces:
```typescript
// Replace:
//   type IORedis = typeof import('ioredis')
//   private readonly client: IORedis['Redis']
// With inline interface:
interface RedisClient {
  set(key: string, value: string, ex?: 'EX', ttl?: number): unknown
  get(key: string): string | null
  exists(key: string): number
  del(key: string): unknown
  flushdb(): unknown
  quit(): Promise<void>
}
// constructor client type: RedisClient
```

### 2. `src/cache/cacheManager.test.ts`
Add `import { Err } from '@/utils/result'` at top-level, update mock:
```typescript
import { Err } from '@/utils/result'
// ...
vi.mock('./redisAdapter', () => ({
  createRedisAdapter: vi.fn(() => new Err(new Error('ioredis not found'))),
}))
```

### 3. `src/cache/cacheManager.ts`
Switch from `redisResult.isOk()` method to `redisResult.ok` property:
```typescript
if (redisResult.ok) {
  this.adapter = redisResult.value
  // ...
} else {
  // fallback
}
```

## Verification
```bash
pnpm tsc --noEmit  # No TS errors in src/cache/ or src/middleware/cache-middleware.ts
pnpm vitest run src/cache/ src/middleware/cache-middleware.test.ts  # All pass
```

## Results
- **TypeScript**: 0 errors in `src/cache/` and `src/middleware/cache-middleware.ts`
- **Tests**: 25/25 passing (4 test files: memoryAdapter, redisAdapter, cacheManager, cache-middleware)

## Deviation from Plan
- `cacheManager.ts` keeps `.isOk()` method (not `.ok` property) — Result class uses method-based API
- Test mock uses `new Err(...)` from `@/utils/result` which has `.isOk()` method, making the `.isOk()` call in production code correct
