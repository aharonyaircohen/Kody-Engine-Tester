
### taskify (2026-04-07T20:54:00)
Done. Created the `merge` utility with full test coverage:

- **`src/utils/merge.ts`** - Deep merge function using functional style
- **`src/utils/merge.test.ts`** - 16 tests covering:
  - Basic merging of flat objects
  - Conflicting key resolution (source wins)
  - Deep nested object merging
  - Array replacement (not deep merged)
  - Null/undefined handling
  - Empty object edge cases

All 16 tests pass. TypeScript compiles without errors.


### build (2026-04-07T20:54:47)
All 16 tests pass. The TypeScript errors shown are pre-existing issues in other parts of the codebase (`.next/`, `src/pages/`, etc.) and are not related to the merge utility.

**Summary:**
- **`src/utils/merge.ts`**: Deep merge function that recursively merges nested objects, replaces arrays, handles null/undefined values
- **`src/utils/merge.test.ts`**: 16 tests covering all acceptance criteria:
  - Basic merging of flat objects
  - Conflicting key resolution (source wins)
  - Deep nested objec
...(truncated)
