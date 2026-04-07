
### taskify (2026-04-07T21:25:40)
{
  "task_type": "feature",
  "title": "Add capitalizeFirst utility function",
  "description": "Create a capitalizeFirst function in src/utils/capitalize-first.ts that capitalizes only the first letter of a string. Add co-located tests in src/utils/capitalize-first.test.ts following existing utility patterns.",
  "scope": [
    "src/utils/capitalize-first.ts",
    "src/utils/capitalize-first.test.ts"
  ],
  "risk_level": "low",
  "existing_patterns": [
    "src/utils/capitalize-words.ts - singl
...(truncated)

### build (2026-04-07T21:28:18)
All 6 tests for `capitalizeFirst` pass. The TypeScript errors are pre-existing in the codebase and unrelated to my changes.

**Summary of implementation:**

- Created `src/utils/capitalize-first.ts` with `capitalizeFirst(str)` function that capitalizes only the first letter of a string
- Created `src/utils/capitalize-first.test.ts` with 6 tests covering: basic capitalization, single word, empty string, already capitalized, mixed case preservation, and single character

