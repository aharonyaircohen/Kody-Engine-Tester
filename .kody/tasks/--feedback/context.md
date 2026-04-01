
### taskify (2026-04-01T07:56:16)
Done. Created:

**`src/utils/partition.ts`** - Two functions:
- `partition<T>(arr, predicate)` - Sync version using a loop-based approach
- `partitionAsync<T>(arr, predicate)` - Async version using `Promise.all` for parallel evaluation

**`src/utils/partition.test.ts`** - 17 tests covering:
- Basic separation (evens/odds, strings by length)
- Edge cases (all match, none match, empty array)
- Non-mutation of original array
- Order preservation
- Object property checks
- `readonly` arrays
- Async 
...(truncated)

### build (2026-04-01T07:58:09)
The TypeScript errors are pre-existing and unrelated to my changes (partition.ts has no errors). All 1670 tests passed.

Refactored both `partition` and `partitionAsync` to use functional style:

- **`partition`**: Uses `reduce` with spread operator (`[...matches, item]`) instead of `push`
- **`partitionAsync`**: Evaluates predicates in parallel with `Promise.all`, then uses `reduce` to split results

Both now use the pattern `arr.reduce(([matches, nonMatches], item) => predicate(item) ? [[...ma
...(truncated)
