
### taskify (2026-04-09T20:30:27)
{
  "task_type": "feature",
  "title": "Add toCapitalCase utility function",
  "description": "Create a new string utility function in src/utils/to-capital-case.ts that converts strings to Capital Case (first letter uppercase, rest lowercase for each word). Should include a co-located test file following existing vitest patterns. The function should handle empty strings, single words, and mixed case inputs.",
  "scope": [
    "src/utils/to-capital-case.ts",
    "src/utils/to-capital-case.test.ts
...(truncated)

### build (2026-04-09T20:32:21)
These TypeScript errors are pre-existing in the project and unrelated to my changes. My new files have no type errors.

**Summary:**
- Created `src/utils/to-capital-case.ts` — utility function that converts strings to Capital Case
- Created `src/utils/to-capital-case.test.ts` — 8 test cases covering empty strings, single words, mixed case inputs, multiple spaces, etc.
- All 8 tests pass

