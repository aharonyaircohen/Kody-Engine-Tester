
### taskify (2026-04-09T17:52:34)
{
  "task_type": "feature",
  "title": "Add queryBuilder utility function",
  "description": "Create src/utils/queryBuilder.ts that builds URL-encoded query strings from key-value objects. Must handle arrays by repeating the key (e.g., ?key=1&key=2), empty objects, and nested objects (stringified). Full test coverage in src/utils/queryBuilder.test.ts.",
  "scope": ["src/utils/queryBuilder.ts", "src/utils/queryBuilder.test.ts"],
  "risk_level": "low",
  "existing_patterns": ["src/utils/debounce.t
...(truncated)

### build (2026-04-09T17:53:39)
**Done.** Created both files:

- `src/utils/queryBuilder.ts` — URL-encoded query string builder with:
  - Simple key-value pairs
  - Arrays repeated by key (e.g., `tags=a&tags=b`)
  - Nested objects stringified
  - Null/undefined values skipped

- `src/utils/queryBuilder.test.ts` — 12 passing tests covering all acceptance criteria

