
### taskify (2026-04-07T20:01:52)
All 15 tests pass. Here's the task classification:

```json
{
  "task_type": "feature",
  "title": "Add pagination helper to src/services/pagination.ts",
  "description": "Create paginate<T>(items: T[], page: number, pageSize: number) function returning { data: T[]; total: number; pages: number; hasNext: boolean } in src/services/pagination.ts with comprehensive tests covering basic pagination, edge cases (empty array, pageSize > total, exact boundaries), error handling (page < 1, pageSize < 1),
...(truncated)

### build (2026-04-07T20:03:30)
## Verification Complete

The pagination helper implementation is complete and correct:

**`src/services/pagination.ts`** - Generic `paginate<T>` function that:
- Accepts `items: T[]`, `page: number`, `pageSize: number`
- Returns `{ data: T[], total: number, pages: number, hasNext: boolean }`
- Validates inputs (throws for `page < 1` or `pageSize < 1`)
- Uses `slice()` for safe array access

**`src/services/pagination.test.ts`** - 15 tests covering:
- Basic pagination (first/middle/last page)
- 
...(truncated)
