## Verdict: PASS

## Summary

Added `debounce` function to `src/lib/utils.ts` with 11 unit tests in `src/lib/utils.test.ts` using fake timers (`vi.useFakeTimers`). All 11 tests pass (17ms). The implementation matches the task-specified type signature `T extends (...args: unknown[]) => void`.

## Findings

### Critical

None.

### Major

None.

### Minor

None.

## Two-Pass Review

**Pass 1 — CRITICAL:**

### SQL & Data Safety
- No SQL operations. N/A.

### Race Conditions & Concurrency
- `clearTimeout` before `setTimeout` on line 25-26 is correct debounce pattern. No race conditions.

### LLM Output Trust Boundary
- No LLM output. N/A.

### Shell Injection
- No shell commands. N/A.

### Enum & Value Completeness
- No enums or status constants introduced.

**Pass 2 — INFORMATIONAL:**

### Conditional Side Effects
- Logic correctly handles leading/trailing combinations:
  - `{ leading: true, trailing: true }`: leading fires immediately + trailing after delay
  - `{ leading: true }`: leading fires immediately, trailing fires once after delay
  - Default (no options): trailing-only after delay
  - `{ trailing: false }`: leading fires immediately, no trailing

### Test Gaps
- Test coverage is comprehensive for the implemented behavior. Tests cover: delay, multiple calls within delay, last args preservation, multiple arguments, leading option, trailing option, both options, re-execution after delay, `this` context preservation, zero delay, and repeated calls after delay.

### Type Coercion at Boundaries
- The task specification required `(...args: unknown[]) => void` which loses type safety on arguments. The existing `src/utils/debounce.ts` uses a more type-safe `(...args: Parameters<T>) => ReturnType<T>` signature. The implementation correctly follows the task specification, but note that `src/lib/utils.ts` and `src/utils/debounce.ts` have different type signatures for the same functionality.

### Performance & Bundle Impact
- No performance concerns. Implementation is a simple debounce with no heavy dependencies.
