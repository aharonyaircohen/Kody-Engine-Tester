
### taskify (2026-04-07T18:18:09)
{
  "task_type": "feature",
  "title": "Add capitalizeFirstLetter utility function",
  "description": "Create a new `capitalizeFirstLetter` utility function in `src/utils/capitalize-first.ts` that takes a string and capitalizes only the first letter while keeping the rest lowercase. Should follow the existing utility pattern in `src/utils/`.",
  "scope": ["src/utils/capitalize-first.ts"],
  "risk_level": "low",
  "existing_patterns": [
    {
      "file": "src/utils/capitalize-words.ts",
      "
...(truncated)

### build (2026-04-07T18:19:55)
The TypeScript errors shown are pre-existing in the codebase (not related to my changes). My implementation is complete:

**Created:**
- `src/utils/capitalize-first.ts` - Utility function that capitalizes only the first letter while lowercasing the rest
- `src/utils/capitalize-first.test.ts` - 6 tests covering edge cases (empty string, single char, already capitalized, mixed case)

**Verification:**
- All 6 tests pass
- TypeScript types are correct (no new errors introduced)

