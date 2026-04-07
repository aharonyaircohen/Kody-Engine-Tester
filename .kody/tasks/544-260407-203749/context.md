
### taskify (2026-04-07T17:38:28)
{
  "task_type": "feature",
  "title": "Add isEven utility function",
  "description": "Create isEven(n: number): boolean utility function in src/utils/math.ts that returns true for even numbers and false for odd numbers. Must handle zero and negative numbers correctly. Include unit tests in src/utils/math.test.ts following the existing single-function-per-file pattern used by clamp.ts and other utilities.",
  "scope": ["src/utils/math.ts", "src/utils/math.test.ts"],
  "risk_level": "low",
  "ex
...(truncated)

### build (2026-04-07T17:39:23)
The TypeScript errors are all pre-existing in `node_modules` and unrelated pages - my `math.ts` and `math.test.ts` have no errors.

**Summary:**

I successfully implemented the `isEven` utility function:

**`src/utils/math.ts`** - Simple utility function that:
- Returns `true` for even numbers (including zero and negatives)
- Returns `false` for odd numbers
- Throws an error for non-integer inputs (floats, NaN, Infinity)

**`src/utils/math.test.ts`** - 8 comprehensive tests covering:
- Even posi
...(truncated)
