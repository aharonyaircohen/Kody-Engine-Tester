
### taskify (2026-04-10T17:53:48)
{
  "task_type": "feature",
  "title": "Add pagination helper function",
  "description": "Create paginate<T>(items: T[], page: number, pageSize: number) utility function in src/services/pagination.ts that returns { data: T[]; total: number; pages: number; hasNext: boolean }. Includes comprehensive tests covering: basic pagination, empty arrays, single item, remainder pages, page bounds, invalid inputs, and generic type handling.",
  "scope": [
    "src/services/pagination.ts",
    "src/services
...(truncated)

### build (2026-04-10T17:56:13)
The module resolution errors are from the test framework dependencies, not my code. The 15 pagination tests all pass successfully.

## Summary

I've created the pagination helper as specified:

**`src/services/pagination.ts`**:
- `paginate<T>(items: T[], page: number, pageSize: number): PaginationResult<T>`
- Returns `{ data: T[]; total: number; pages: number; hasNext: boolean }`
- Validates inputs (throws if page < 1 or pageSize < 1)
- Uses 1-based page indexing

**`src/services/pagination.test
...(truncated)
