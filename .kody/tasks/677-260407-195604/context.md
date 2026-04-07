
### taskify (2026-04-07T20:00:44)
{
  "task_type": "feature",
  "title": "Add search filter builder function",
  "description": "Created `buildSearchFilter(query: string, fields: string[]): object` in `src/services/search-filter.ts` that builds a Payload-compatible where clause for multi-field text search. The function uses the `like` operator with an `or` condition across specified fields, following the same pattern used in `CourseSearchService`. Includes 13 comprehensive tests covering edge cases (empty/whitespace queries, emp
...(truncated)

### build (2026-04-07T20:02:48)
The implementation is complete:

**Summary:**
- `src/services/search-filter.ts` - implements `buildSearchFilter(query: string, fields: string[]): Where | undefined` that creates a Payload-compatible where clause using the `like` operator with an `or` condition across specified fields
- `src/services/search-filter.test.ts` - 13 comprehensive tests covering basic search, empty/whitespace handling, edge cases (special chars, unicode, numeric strings), and Payload compatibility

**Verification:**
- 
...(truncated)
