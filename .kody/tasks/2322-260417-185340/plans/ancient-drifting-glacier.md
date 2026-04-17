# Plan: Fix Critical TypeScript Errors in Cache System (P3T30)

## Context

The review found 2 Critical issues preventing TypeScript compilation. The source files exist (`src/cache/`, `src/middleware/cache-middleware.ts`) but have type errors. The fix approach: surgical `Edit` operations only.

## Root Cause Diagnosis

### Critical 1 — `src/cache/redisAdapter.ts:6`
`typeof import('ioredis')` at top level causes `TS2307: Cannot find module 'ioredis'` because TypeScript resolves type-only imports at compile time regardless of `tryCatch` wrapping. The `require('ioredis')` inside `tryCatch` is fine at runtime, but the top-level `import type` is not.

**Fix:** Remove `typeof import('ioredis')` line entirely. Define `IORedis` as a plain interface matching the minimal Redis client shape (`{ default: new (opts?: object) => { get(k: string): string | null; set(k: string, v: string, ex?: string, ttl?: number): void; exists(k: string): number; del(k: string): void; flushdb(): void; quit(): Promise<void> } }`). Type-cast the client via `as unknown as` inside the factory.

### Critical 2 — `src/middleware/cache-middleware.ts:1`
Imports `type { Middleware } from '@/utils/middleware'` but `src/utils/middleware.ts` does not exist. Same import appears in `src/middleware/cache-middleware.test.ts:2`.

**Fix:** Create `src/utils/middleware.ts` defining `Middleware<T>` and `Pipeline<T>`. Based on usage in tests, the required API is:
- `Pipeline<T>` class with `.use(fn): Pipeline<T>` and `.run(ctx): Promise<void>`
- `Middleware<T>` = `(ctx: T, next: () => Promise<void>) => Promise<void>`
- `createPipeline<T>()` returns a `Pipeline<T>`

## Changes (in order)

### 1. Create `src/utils/middleware.ts` (new file)
Defines the middleware pipeline types that both `cache-middleware.ts` and its test need.

```typescript
// src/utils/middleware.ts

export type Middleware<T> = (ctx: T, next: () => Promise<void>) => Promise<void>

export interface Pipeline<T> {
  use(fn: Middleware<T>): Pipeline<T>
  run(ctx: T): Promise<void>
}

export function createPipeline<T>(): Pipeline<T> {
  const stack: Middleware<T>[] = []

  async function run(ctx: T): Promise<void> {
    let index = 0
    async function next() {
      const fn = stack[index++]
      if (fn) await fn(ctx, next)
    }
    await next()
  }

  return {
    use(fn: Middleware<T>) {
      stack.push(fn)
      return this
    },
    run,
  }
}
```

### 2. Fix `src/cache/redisAdapter.ts` (surgical Edit)
Remove the top-level `typeof import('ioredis')` line (line 6). The type cast inside the factory (`as unknown as IORedis['Redis']`) will be updated to use the inline interface.

- Remove line 6: `type IORedis = typeof import('ioredis')`
- Update line 12 to use the inline shape: `private readonly client: { get(k: string): string | null; set(k: string, v: string, ex?: string, ttl?: number): void; exists(k: string): number; del(k: string): void; flushdb(): void; quit(): Promise<void> }`
- Change line 62 cast from `require('ioredis') as IORedis` to `require('ioredis') as unknown as { default: ConstructorForRedisClient }`

### 3. Verify with tests
```bash
pnpm test:int
pnpm tsc --noEmit
```

## Files Modified
- `src/utils/middleware.ts` — **created** (new)
- `src/cache/redisAdapter.ts` — **edited** (remove type import, add inline type)

## Not Modified (no changes needed)
- `src/cache/memoryAdapter.ts` — correct, no errors
- `src/cache/cacheManager.ts` — correct, no errors
- `src/middleware/cache-middleware.ts` — will auto-resolve once `src/utils/middleware.ts` exists
- Test files — already correct, will pass once source is fixed
