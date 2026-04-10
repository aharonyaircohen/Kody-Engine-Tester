
### taskify (2026-04-10T01:11:38)
{
  "task_type": "feature",
  "title": "Add search filter builder for Payload multi-field text search",
  "description": "Create `buildSearchFilter(query: string, fields: string[]): object` in `src/services/search-filter.ts` that builds a Payload-compatible where clause for multi-field text search using the `like` operator with an `or` condition across specified fields. Include comprehensive tests in `src/services/search-filter.test.ts` following the project's vitest patterns.",
  "scope": [
   
...(truncated)

### build (2026-04-10T01:17:16)
Implementation complete. Here's a summary:

**Created files:**

1. **`src/services/search-filter.ts`** - `buildSearchFilter(query: string, fields: string[]): Where | undefined`
   - Builds a Payload-compatible Where clause with `or` condition
   - Uses `like` operator for each specified field
   - Returns `undefined` for empty/whitespace-only queries or empty fields
   - Filters out invalid (empty/whitespace) field names

2. **`src/services/search-filter.test.ts`** - 13 comprehensive tests cover
...(truncated)
