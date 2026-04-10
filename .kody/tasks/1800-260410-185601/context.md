
### taskify (2026-04-10T18:58:49)
{
  "task_type": "feature",
  "title": "Add pagination helper function",
  "description": "Create paginate<T>(items: T[], page: number, pageSize: number): { data: T[]; total: number; pages: number; hasNext: boolean } in src/services/pagination.ts with co-located tests following the existing utility function patterns.",
  "scope": ["src/services/pagination.ts", "src/services/pagination.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src/utils/chunk.ts - Single-function utility mod
...(truncated)

### build (2026-04-10T19:00:52)

The TypeScript errors are all pre-existing issues unrelated to my pagination changes. The implementation is complete:

**Summary:**
- Created `src/services/pagination.ts` with `paginate<T>(items, page, pageSize)` function returning `{ data, total, pages, hasNext }`
- Created `src/services/pagination.test.ts` with 11 tests covering all edge cases
- All tests pass

