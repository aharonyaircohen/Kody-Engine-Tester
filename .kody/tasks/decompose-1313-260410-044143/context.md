
### taskify (2026-04-10T04:44:33)
{
  "task_type": "feature",
  "title": "Add capitalize utility function",
  "description": "Create src/utils/capitalize.ts with a string capitalize utility function that capitalizes the first letter of a string, and add co-located tests in src/utils/capitalize.test.ts following the existing pattern from cap.ts/cap.test.ts",
  "scope": [
    "src/utils/capitalize.ts",
    "src/utils/capitalize.test.ts"
  ],
  "risk_level": "low",
  "existing_patterns": [
    "src/utils/cap.ts - single-function ut
...(truncated)

### build (2026-04-10T04:46:24)
The TypeScript errors shown are pre-existing in the codebase and unrelated to my changes. The capitalize utility I implemented has no type errors.

**Summary of implementation:**

Created two new files following the established pattern from `cap.ts`/`cap.test.ts`:

1. **`src/utils/capitalize.ts`** - String capitalize utility function that capitalizes the first letter of a string
2. **`src/utils/capitalize.test.ts`** - Co-located test file with 5 test cases covering:
   - Capitalizing simple stri
...(truncated)
