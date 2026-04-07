The lint errors are all pre-existing in other files — none are in the new `cache-invalidation.ts` or `cache-invalidation.test.ts`.

## Verdict: PASS

## Summary

The `CacheInvalidationStore.invalidate()` method now properly clears cache keys from `keysByPattern` before calling the registered callback. The previous major finding is resolved.

## Findings

### Critical

None.

### Major

None.

### Minor

- `src/middleware/cache-invalidation.test.ts:43,52` — Tests reach into private state via `as unknown as { invalidations: Map<string, () => void> }` rather than testing `add()` + `invalidate()` through the public API. This is acceptable for unit-testing internal callback behavior, but a future refactor of `invalidations` to e.g. a `Set<() => void>` would silently break these tests.

## Two-Pass Review

**Pass 1 — CRITICAL (must fix before merge):**

### SQL & Data Safety
None.

### Race Conditions & Concurrency
None.

### LLM Output Trust Boundary
None.

### Shell Injection
None.

### Enum & Value Completeness
None.

**Pass 2 — INFORMATIONAL (should review, may auto-fix):**

### Conditional Side Effects
None.

### Test Gaps
None.

### Dead Code & Consistency
None.

### Crypto & Entropy
None.

### Performance & Bundle Impact
None.

### Type Coercion at Boundaries
None.
