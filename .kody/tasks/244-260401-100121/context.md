
### build (2026-04-01T12:11:06)
Done. Created the bisect utility with the following:

**`src/utils/bisect.ts`** - 3 functions:
- `bisectLeft(arr, value, comparator?)` - finds leftmost insertion point for sorted array
- `bisectRight(arr, value, comparator?)` - finds rightmost insertion point
- `insort(arr, value, comparator?)` - inserts value in-place, returns index

**`src/utils/bisect.test.ts`** - 24 tests covering:
- Empty arrays
- Values less than/greater than all elements  
- Values between elements
- Duplicate handling (l
...(truncated)
