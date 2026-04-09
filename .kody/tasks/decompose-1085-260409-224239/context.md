
### taskify (2026-04-09T22:45:58)
{
  "task_type": "feature",
  "title": "Add string capitalize utility function",
  "description": "Create a new string capitalize utility function in src/utils/ with tests. The function should capitalize only the first letter of a string, handling empty strings and single characters appropriately. Should follow existing utility patterns with co-located test file.",
  "scope": ["src/utils/capitalize.ts", "src/utils/capitalize.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src/uti
...(truncated)

### build (2026-04-09T22:49:14)
The TypeScript errors are pre-existing issues in the codebase (in `.next/types/validator.ts`, various page files, and test helpers) - not related to my changes. My new files `capitalize.ts` and `capitalize.test.ts` are error-free.

## Summary

I've completed the `build` stage by creating:

1. **`src/utils/capitalize.ts`** - A utility function that capitalizes only the first letter of a string, handling empty strings and single characters

2. **`src/utils/capitalize.test.ts`** - Co-located tests 
...(truncated)
