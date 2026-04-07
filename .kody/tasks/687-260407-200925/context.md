
### taskify (2026-04-07T20:14:04)
All 18 tests pass. Here's the summary:

**Created files:**
- `src/utils/object-helpers.ts` — exports `deepMerge<T>(target: T, source: Partial<T>): T` with recursive merge for nested objects, arrays replaced (not concatenated), and no target mutation
- `src/utils/object-helpers.test.ts` — 18 test cases covering primitives, shallow/deep merge, arrays, null handling, type preservation, and edge cases


### build (2026-04-07T20:15:29)
All **18/18 tests pass**. 

**Summary of completed work:**

- **`src/utils/object-helpers.ts`** — exports `deepMerge<T>(target: T, source: Partial<T>): T` with:
  - Recursive deep merge for nested objects
  - Arrays replaced (not concatenated)
  - No target mutation (returns new object)
  - Proper type preservation

- **`src/utils/object-helpers.test.ts`** — 18 test cases covering:
  - Primitives and non-objects
  - Shallow and deep merge
  - Array replacement
  - Null handling
  - Type preserva
...(truncated)
