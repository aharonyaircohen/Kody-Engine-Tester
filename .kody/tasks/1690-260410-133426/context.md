
### taskify (2026-04-10T13:37:05)

{
"task_type": "feature",
"title": "Add pagination helper",
"description": "Create `paginate<T>(items: T[], page: number, pageSize: number): { data: T[]; total: number; pages: number; hasNext: boolean }` in `src/services/pagination.ts` with comprehensive tests in `src/services/pagination.test.ts`. The function should slice the items array based on page/pageSize, calculate total pages, and return hasNext boolean.",
"scope": ["src/services/pagination.ts", "src/services/pagination.test.ts"],
"risk
...(truncated)

### build (2026-04-10T13:38:08)
Implementation complete. Created:

1. **`src/services/pagination.ts`** - Pagination helper function that:
   - Takes `items: T[]`, `page: number`, `pageSize: number` as parameters
   - Returns `{ data: T[]; total: number; pages: number; hasNext: boolean }`
   - Validates `pageSize > 0` and `page >= 1` with descriptive error messages
   - Uses 1-indexed pages (standard pagination behavior)
   - Calculates `hasNext` based on whether there are more pages

2. **`src/services/pagination.test.ts`** - 
...(truncated)
