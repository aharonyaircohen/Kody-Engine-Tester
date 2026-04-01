
### build (2026-04-01T08:08:22)
Done. Created two files:

- **`src/utils/shuffle.ts`** — Fisher-Yates shuffle with optional `seed` parameter using a mulberry32 PRNG for reproducible results
- **`src/utils/shuffle.test.ts`** — 11 tests covering: same elements, non-mutation, random variation, seeded reproducibility, different seeds, empty/single-element arrays, strings, objects, mixed types, and two-element edge case

All 11 tests pass and TypeScript is clean on both files.


### review (2026-04-01T08:09:13)
## Verdict: PASS

## Summary

Implements a Fisher-Yates shuffle utility (`src/utils/shuffle.ts`) with optional seed support via mulberry32 PRNG. Includes 11 tests covering standard cases, reproducibility, and edge cases.

## Findings

### Critical
None.

### Major
None.

### Minor
- `shuffle.test.ts:64` — Mixed-types sort comparatorless: `result.sort()` with no comparator has environment-dependent ordering for mixed types (e.g., `1` vs `'a'`). The `toEqual` still passes because it checks element
...(truncated)

### review-fix (2026-04-01T08:09:23)
The review passed with no Critical or Major findings. The Minor note about the mixed-types sort comparator is a non-blocking observation — `toEqual` checks exact element equality regardless of sort order, so the test is correct. No fixes needed.

