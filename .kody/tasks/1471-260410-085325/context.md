
### taskify (2026-04-10T08:57:42)
{
  "task_type": "feature",
  "title": "Add pagination helper",
  "description": "Create `paginate<T>(items: T[], page: number, pageSize: number): { data: T[]; total: number; pages: number; hasNext: boolean }` utility function in `src/services/pagination.ts` with comprehensive tests in `src/services/pagination.test.ts`. The function should slice the items array based on page/pageSize and return metadata about the pagination state.",
  "scope": [
    "src/services/pagination.ts",
    "src/service
...(truncated)

### build (2026-04-10T08:59:58)
These TypeScript errors are pre-existing in the codebase and not related to my pagination changes. My implementation is complete:

**Summary:**

Created two files following the project conventions:

1. **`src/services/pagination.ts`** - Pagination helper with JSDoc comments:
   - `paginate<T>(items, page, pageSize)` function
   - Returns `{ data, total, pages, hasNext }`
   - Validates inputs (page >= 1, pageSize >= 1)

2. **`src/services/pagination.test.ts`** - 13 tests covering:
   - First, mi
...(truncated)
