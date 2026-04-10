
### taskify (2026-04-10T15:53:29)
{
  "task_type": "feature",
  "title": "Add partition utility function",
  "description": "Add a `partition<T>(array: T[], predicate: (item: T) => boolean): [T[], T[]]` function in `src/utils/partition.ts` that splits an array into two groups based on a predicate. The first tuple contains items where predicate returned true, the second contains items where it returned false. Include edge case handling for empty arrays and follow existing utility function patterns in the codebase. Add comprehensi
...(truncated)

### build (2026-04-10T15:54:37)
The implementation is complete:

**Created files:**
- `src/utils/partition.ts` - Generic partition function with JSDoc documentation
- `src/utils/partition.test.ts` - 9 comprehensive tests covering basic cases, edge cases, type mixing, and order preservation

**All tests pass** (9/9). The implementation follows existing patterns from `chunk.ts` and `group-by.ts`:
- Generic type parameter `<T>`
- JSDoc documentation
- Clean iteration with for...of
- Return type `[T[], T[]]` tuple

