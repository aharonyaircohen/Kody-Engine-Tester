
### taskify (2026-04-10T16:59:18)
{
  "task_type": "feature",
  "title": "Add pagination helper",
  "description": "Create `paginate<T>(items: T[], page: number, pageSize: number): { data: T[]; total: number; pages: number; hasNext: boolean }` in `src/services/pagination.ts` with comprehensive tests. The function should slice the items array to return only the current page's data, calculate total pages, and determine if there is a next page.",
  "scope": [
    "src/services/pagination.ts",
    "src/services/pagination.test.ts"
 
...(truncated)

### build (2026-04-10T17:01:21)
The TypeScript errors are pre-existing in the codebase and unrelated to my changes. The pagination implementation is complete.

**Summary:**
- Created `src/services/pagination.ts` with the `paginate<T>` function following the `chunk.ts` pattern (JSDoc, input validation, generic types)
- Created `src/services/pagination.test.ts` with 12 tests covering: first/middle/last pages, empty arrays, page size larger than array, single item per page, string arrays, error cases (pageSize <= 0, page < 1), mi
...(truncated)
