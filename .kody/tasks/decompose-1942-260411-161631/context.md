
### taskify (2026-04-11T16:24:52)
{
  "task_type": "feature",
  "title": "Add string capitalize utility function",
  "description": "Add a string capitalize utility function in src/utils/stringUtils.ts with co-located tests in src/utils/stringUtils.test.ts. The function should capitalize the first letter of a string (and only the first letter). This is a simple task with complexity_score expected to be < 4, triggering fallback to normal pipeline and PR creation via runPipeline().",
  "scope": ["src/utils/stringUtils.ts", "src/ut
...(truncated)

### build (2026-04-11T16:25:33)
Done. I've implemented the task:

**Created files:**
- `src/utils/stringUtils.ts` - with `capitalize(str)` function that capitalizes only the first letter
- `src/utils/stringUtils.test.ts` - 7 tests covering: basic capitalize, single character, empty string, already capitalized, lowercase only, uppercase strings

**Test results:** 7 tests passing in 4ms.

