
### taskify (2026-04-09T19:22:27)
Based on my exploration, this is a task to create the `queryBuilder.ts` utility that was discussed in the PR. The key clarification needed is around the quoting behavior.

```json
{
  "task_type": "feature",
  "title": "Add queryBuilder utility for URL query string construction",
  "description": "Create src/utils/queryBuilder.ts that builds URL-encoded query strings from key-value objects. Must handle arrays by repeating the key (e.g., ?key=1&key=2), empty objects, nested objects (stringified),
...(truncated)

### build (2026-04-09T19:24:11)
The `queryBuilder` utility is complete with all 15 tests passing and no type errors.

**Summary of implementation:**

- **`src/utils/queryBuilder.ts`** - URL-encoded query string builder that:
  - Handles arrays by repeating the key (e.g., `?tags="a"&tags="b"`)
  - Handles nested objects via JSON.stringify
  - Wraps values in double quotes
  - Encodes `$` as `%24` via `encodeURIComponent`
  - Skips `null`/`undefined` values

- **`src/utils/queryBuilder.test.ts`** - 15 tests covering:
  - Empty o
...(truncated)
