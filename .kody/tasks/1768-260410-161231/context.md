
### taskify (2026-04-10T16:31:01)
All 11 tests pass. Here's the classification:

```json
{
  "task_type": "feature",
  "title": "Add pagination helper",
  "description": "Create `paginate<T>(items: T[], page: number, pageSize: number): { data: T[]; total: number; pages: number; hasNext: boolean }` in `src/services/pagination.ts`. With tests.",
  "scope": [
    "src/services/pagination.ts",
    "src/services/pagination.test.ts"
  ],
  "risk_level": "low",
  "existing_patterns": [
    "src/utils/chunk.ts - Single-function utility 
...(truncated)

### build (2026-04-10T16:32:44)
The implementation is verified and working correctly.

## Summary

The pagination helper has already been implemented:

**`src/services/pagination.ts`**:
- `paginate<T>(items: T[], page: number, pageSize: number): PaginationResult<T>`
- Returns `{ data: T[], total: number, pages: number, hasNext: boolean }`
- Validates inputs (page >= 1, pageSize >= 1)
- Uses 1-indexed pages with `slice` for zero-indexed array access

**`src/services/pagination.test.ts`**:
- 11 tests covering: first/middle/last 
...(truncated)
