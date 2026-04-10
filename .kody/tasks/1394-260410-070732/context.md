
### taskify (2026-04-10T07:11:24)
All 12 tests pass. Here's the task classification:

```json
{
  "task_type": "feature",
  "title": "Add pagination helper",
  "description": "Create paginate<T>(items: T[], page: number, pageSize: number) function in src/services/pagination.ts that returns { data: T[]; total: number; pages: number; hasNext: boolean } with 12 tests covering page slicing, edge cases (empty array, page beyond total, remainder), type handling, and validation errors",
  "scope": ["src/services/pagination.ts", "src/se
...(truncated)

### build (2026-04-10T07:13:12)
The pagination implementation is complete and verified:

**`src/services/pagination.ts`** - Generic `paginate<T>` function:
- Validates `page >= 1` and `pageSize >= 1` with error messages
- Returns `{ data: T[]; total: number; pages: number; hasNext: boolean }`
- Uses `slice` for efficient data extraction
- Handles edge cases: empty arrays, pages beyond range, remainder handling

**`src/services/pagination.test.ts`** - 12 tests covering:
- First/middle/last page retrieval
- Page size larger than
...(truncated)
