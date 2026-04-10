
### taskify (2026-04-10T04:43:18)
All tests pass. Here's the task classification:

```json
{
  "task_type": "feature",
  "title": "Add sum utility function",
  "description": "Add a `sum` utility function in `src/utils/sum.ts` that takes an array of numbers and returns their sum. The function handles empty arrays by returning 0, uses the `reduce` pattern, and is accompanied by comprehensive unit tests covering positive numbers, negative numbers, floating point numbers, and edge cases.",
  "scope": [
    "src/utils/sum.ts",
    "
...(truncated)

### build (2026-04-10T04:43:43)
All acceptance criteria are satisfied:

| Criteria | Status |
|----------|--------|
| `src/utils/sum.ts` exports a default `sum` function | ✅ |
| Function signature: `(numbers: number[]) => number` | ✅ |
| Handles empty arrays (returns 0) | ✅ |
| `src/utils/sum.test.ts` has unit tests | ✅ (5 tests passing) |

The implementation is complete. `sum` uses `Array.reduce` with an initial value of `0`, correctly handling empty arrays. The test suite covers: empty arrays, single elements, multiple numbe
...(truncated)
