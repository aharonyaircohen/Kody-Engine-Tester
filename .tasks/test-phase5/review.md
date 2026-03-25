## Verdict: PASS

## Summary
Added a `clamp` utility function (`src/utils/clamp.ts`) that constrains a number to a `[min, max]` range, along with a comprehensive test suite (`src/utils/clamp.test.ts`). All 8 tests pass.

## Findings

### Critical
None.

### Major
None.

### Minor
- No validation when `min > max` — the function silently returns an incorrect result in that case (e.g., `clamp(5, 10, 0)` returns `0` instead of `5`). This is an edge case that could silently mislead callers, though it's not required by the task spec. No test covers it.
