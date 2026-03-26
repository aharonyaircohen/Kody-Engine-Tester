I have enough context. Here is my plan:

## Plan

### Step 1: Write tests for di-container covering all 7 requirements
**File:** `src/utils/di-container.test.ts`
**Change:** Create comprehensive test suite with Vitest covering:
- `Token<T>` branded type creation and usage
- `register` / `resolve` basic flow
- `registerSingleton` — same instance returned on multiple resolves
- `registerTransient` — new instance each time
- Dependency chain: factory calls `resolve()` for other deps
- Circular dependency detection with clear error
- `dispose()` calls `dispose()` on singletons implementing `Disposable`
- `createChild()` inherits parent registrations, can override
- Child containers dispose independently
**Verify:** `pnpm vitest run src/utils/di-container.test.ts` (red phase — tests should fail)

### Step 2: Implement di-container.ts
**File:** `src/utils/di-container.ts`
**Change:** Implement full container:
- `Token<T>` as a branded `symbol` type with phantom `T`
- Internal registry map keyed by symbol
- `Container` class with `register`, `registerSingleton`, `registerTransient`, `resolve`, `dispose`, `createChild`
- Circular dependency detection via a "resolving" Set passed through resolve chain
- `Disposable` interface check before calling dispose
- Child containers share parent registry but have own singletons cache and resolving set
**Verify:** `pnpm vitest run src/utils/di-container.test.ts` (green phase — all tests pass)

### Step 3: Type-check the implementation
**Verify:** `pnpm tsc --noEmit` passes
