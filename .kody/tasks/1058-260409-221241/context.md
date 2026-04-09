
### taskify (2026-04-09T22:15:28)
{
  "task_type": "feature",
  "title": "Add search filter builder",
  "description": "Create `buildSearchFilter(query: string, fields: string[]): object` in `src/services/search-filter.ts` that creates a Payload-compatible where clause for multi-field text search. The function should return a Where clause using `or` conditions with `like` operator for each field. Include co-located tests in `src/services/search-filter.test.ts`.",
  "scope": [
    "src/services/search-filter.ts",
    "src/service
...(truncated)

### build (2026-04-09T22:16:57)
The type errors are all pre-existing issues in `node_modules`, not from my changes. My implementation is complete and working.

**Summary:**

Created `src/services/search-filter.ts`:
- `buildSearchFilter(query: string, fields: string[]): Where` - creates a Payload-compatible where clause for multi-field text search
- Uses `or` conditions with `like` operator for each field (following the pattern from `course-search.ts:46-53`)
- Handles edge cases: empty query, whitespace-only query, empty fields
...(truncated)
