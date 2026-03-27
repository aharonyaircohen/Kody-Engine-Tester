The 8 unit tests all pass. The failing test is the pre-existing integration test (`tests/int/api.int.spec.ts`) that requires a database connection — unrelated to this task.

## Verdict: PASS

## Summary
Implemented a `groupBy` utility function in `src/utils/group-by.ts` with a comprehensive 8-test suite in `src/utils/group-by.test.ts`, following TDD methodology. The vitest config was updated to discover unit tests in `src/`.

## Findings

### Critical
None.

### Major
None.

### Minor
- `result[key].push(item)` mutates the arrays inside `result`. This is expected behavior (grouping accumulates items), but worth noting: the function doesn't mutate the *input* array (correctly tested), and returning a fresh grouped object per call is correct. No issue here.
- The `if (!result[key])` guard would treat an empty array `[]` as falsy — however since new arrays are only added by this function and immediately pushed to, this edge case cannot arise. A more defensive `result[key] === undefined` check would be clearer but not necessary.
