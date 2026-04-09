
### taskify (2026-04-09T17:14:37)
{
  "task_type": "feature",
  "title": "Add pagination helper",
  "description": "Create `paginate<T>(items: T[], page: number, pageSize: number): { data: T[]; total: number; pages: number; hasNext: boolean }` utility function in `src/services/pagination.ts` with comprehensive tests. The function should slice items for the given page and return metadata about pagination state.",
  "scope": ["src/services/pagination.ts", "src/services/pagination.test.ts"],
  "risk_level": "low",
  "existing_patte
...(truncated)

### build (2026-04-09T17:16:55)
Implementation complete. Summary:

**Created files:**
- `src/services/pagination.ts` - The `paginate<T>` function that slices an array for the given page and returns metadata (`data`, `total`, `pages`, `hasNext`)
- `src/services/pagination.test.ts` - 11 comprehensive tests covering edge cases

**Tests:** All 11 pagination tests pass.

