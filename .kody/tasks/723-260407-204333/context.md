
### taskify (2026-04-07T20:45:58)
{
  "task_type": "feature",
  "title": "Add buildSearchFilter utility for Payload text search",
  "description": "Create `buildSearchFilter(query: string, fields: string[]): object` in `src/services/search-filter.ts` that builds a Payload-compatible `Where` clause for multi-field text search using the `like` operator. Follow the existing `or` pattern from `course-search.ts` where each field gets a `{ field: { like: query } }` condition. Include co-located tests in `src/services/search-filter.tes
...(truncated)

### build (2026-04-07T20:47:53)
The TypeScript errors shown are all pre-existing issues in the codebase, none related to my new files. The `search-filter.ts` and `search-filter.test.ts` are type-safe.

**Summary:**
- Created `src/services/search-filter.ts` with `buildSearchFilter(query: string, fields: string[]): Where` function
- Created `src/services/search-filter.test.ts` with 6 tests covering the function behavior
- All 6 tests pass
- Follows the existing `or` + `like` pattern from `course-search.ts:47-53`

