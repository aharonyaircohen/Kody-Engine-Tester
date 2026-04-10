
### taskify (2026-04-10T14:40:44)
{
"task_type": "feature",
"title": "Add pagination helper",
"description": "Create `paginate<T>(items: T[], page: number, pageSize: number): { data: T[]; total: number; pages: number; hasNext: boolean }` in `src/services/pagination.ts` with comprehensive tests in `src/services/pagination.test.ts`. Follow the existing single-function utility pattern seen in `src/utils/chunk.ts`.",
"scope": ["src/services/pagination.ts", "src/services/pagination.test.ts"],
"risk_level": "low",
"existing_patterns":
...(truncated)

### build (2026-04-10T14:43:01)

No pagination-related TypeScript errors. 

**Summary:**
- Created `src/services/pagination.ts` with the `paginate<T>` function following the `chunk.ts` pattern (JSDoc, generic type, error handling for invalid input)
- Created `src/services/pagination.test.ts` with 13 tests covering:
  - Normal pagination
  - First/last page handling
  - Page beyond total pages
  - Empty array
  - pageSize larger than array
  - pageSize of 1
  - Error cases (page/pageSize <= 0)
  - String arrays
  - Mixed types

...(truncated)
