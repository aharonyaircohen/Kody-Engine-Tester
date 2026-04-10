
### taskify (2026-04-10T10:31:12)
{
  "task_type": "feature",
  "title": "Add pagination helper",
  "description": "Create `paginate<T>(items: T[], page: number, pageSize: number): { data: T[]; total: number; pages: number; hasNext: boolean }` in `src/services/pagination.ts`. With co-located tests following the existing utility pattern (generic type, JSDoc, error handling for invalid inputs).",
  "scope": ["src/services/pagination.ts", "src/services/pagination.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src/u
...(truncated)

### build (2026-04-10T10:33:30)
These TypeScript errors are pre-existing and unrelated to my changes (they're in `board/modal`, `error/ErrorPage`, `notes`, `contacts`, and `seedUser.ts`).

**Summary:**

Created the pagination helper following the established pattern from `chunk.ts`:

- **`src/services/pagination.ts`** - Generic `paginate<T>(items, page, pageSize)` function returning `{ data, total, pages, hasNext }` with error handling for invalid inputs (pageSize ≤ 0, page < 1)
- **`src/services/pagination.test.ts`** - 12 tes
...(truncated)
