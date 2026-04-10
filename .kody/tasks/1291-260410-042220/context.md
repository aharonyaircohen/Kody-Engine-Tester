
### taskify (2026-04-10T04:26:01)
Done. Created:
- `src/services/search-filter.ts` — `buildSearchFilter(query, fields)` returns a Payload-compatible `{ or: [{ field: { like: query } }] }` where clause
- `src/services/search-filter.test.ts` — 8 tests covering empty query/fields, single/multiple fields, whitespace trimming, and JSON serialization

All 151 service tests pass.

```json
{
  "task_type": "feature",
  "title": "Add search filter builder",
  "description": "Create buildSearchFilter(query: string, fields: string[]): obje
...(truncated)

### build (2026-04-10T04:28:05)
The TypeScript errors are all from `node_modules` (third-party package type issues), not from the search-filter implementation.

## Verification Summary

**Implementation: `src/services/search-filter.ts`**
- `buildSearchFilter(query: string, fields: string[]): Where` function
- Returns `{}` when query is empty/whitespace or fields array is empty
- Uses Payload `like` operator with `or` conditions for multi-field text search
- Pattern matches exactly what's used in `course-search.ts:47-53`

**Tes
...(truncated)
