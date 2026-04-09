
### taskify (2026-04-09T23:48:56)
{
  "task_type": "feature",
  "title": "Add buildSearchFilter utility for Payload multi-field search",
  "description": "Create `buildSearchFilter(query: string, fields: string[]): object` in `src/services/search-filter.ts` that generates a Payload-compatible `Where` clause for multi-field text search using the `like` operator. Should return an object with an `or` condition combining all fields. Empty query should return an empty object. Include co-located tests.",
  "scope": [
    "src/services
...(truncated)

### build (2026-04-09T23:51:03)
Done. Created two files:

**`src/services/search-filter.ts`** — Utility function that:
- Returns `{}` for empty query or empty fields array
- Returns `{ or: [{ field: { like: query } }, ...] }` for valid input

**`src/services/search-filter.test.ts`** — 9 tests covering:
- Empty query/fields returns `{}`
- Whitespace-only query returns `{}`
- Single and multiple fields produce correct `or` structure
- Query casing is preserved in `like` operator
- Null/undefined query edge cases

All 9 tests pas
...(truncated)
