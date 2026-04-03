
### taskify (2026-04-03T21:59:37)
```json
{
  "task_type": "feature",
  "title": "Add titleCase utility function",
  "description": "Create src/utils/title-case.ts with a titleCase function that converts strings to title case, following standard English title case conventions (capitalizing major words, leaving small words like 'the', 'of', 'and' lowercase unless first/last). Include unit tests following the existing test pattern.",
  "scope": [
    "src/utils/title-case.ts",
    "src/utils/title-case.test.ts"
  ],
  "risk_level"
...(truncated)

### build (2026-04-03T22:03:29)
The type errors are pre-existing in the project and not related to my new files. My implementation is complete.

## Summary

Created two new files:

**`src/utils/title-case.ts`** - A utility function that converts strings to title case following standard English conventions:
- Capitalizes first and last word (even if they're "small words")
- Leaves small words lowercase in the middle (articles, conjunctions, prepositions)
- Handles empty strings, single words, multiple spaces, and mixed case

**
...(truncated)
