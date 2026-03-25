## Verdict: PASS

## Summary
Implemented a `debounce` utility function (`src/utils/debounce.ts`) with a comprehensive test suite using Vitest fake timers. Also updated `vitest.config.mts` to include `src/**/*.test.ts` files and `kody.config.json` to exclude integration tests from unit test runs.

## Findings

### Critical
None.

### Major
None.

### Minor
- `debounce.ts:8` — The `if (timeoutId !== undefined)` check is redundant; `clearTimeout(undefined)` is a no-op in JS/Node. The guard can be removed for simplicity, though it doesn't affect correctness.
- The generic constraint `T extends (...args: Parameters<T>) => void` is slightly circular — a simpler `T extends unknown[]` with explicit args typing would be more idiomatic, but the current form works correctly.

All 8 tests pass. Implementation correctly handles timer reset, argument forwarding, zero-delay, and multiple independent invocations.
