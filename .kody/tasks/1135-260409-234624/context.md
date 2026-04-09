
### taskify (2026-04-09T23:48:58)
```json
{
  "task_type": "feature",
  "title": "Add pagination helper",
  "description": "Create `paginate<T>(items: T[], page: number, pageSize: number): { data: T[]; total: number; pages: number; hasNext: boolean }` in `src/services/pagination.ts` with co-located tests in `src/services/pagination.test.ts`. The function should slice the items array for the requested page and return metadata about pagination state.",
  "scope": ["src/services/pagination.ts", "src/services/pagination.test.ts"],
 
...(truncated)

### build (2026-04-09T23:50:28)
Done. Created the pagination helper:

**`src/services/pagination.ts`** - Generic `paginate<T>` function that:
- Slices items array for the requested 1-based page
- Returns `{ data, total, pages, hasNext }` metadata
- Throws errors for invalid `pageSize <= 0` or `page < 1`

**`src/services/pagination.test.ts`** - 12 tests covering:
- First, middle, last pages
- Empty arrays
- Page size larger than array
- Single item per page
- String and object arrays
- Edge cases (page beyond total pages, exact
...(truncated)
