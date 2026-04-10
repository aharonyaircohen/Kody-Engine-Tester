
### taskify (2026-04-10T09:55:16)
{
  "task_type": "feature",
  "title": "Add string capitalize utility function",
  "description": "Add a string capitalize utility function in src/utils/capitalize.ts that capitalizes the first letter of a string, with tests. Follows existing utility pattern from reverse.ts and capitalize-words.ts.",
  "scope": ["src/utils/capitalize.ts", "src/utils/capitalize.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src/utils/reverse.ts - single-function utility with simple string transfo
...(truncated)

### build (2026-04-10T09:57:07)
The implementation is complete and verified:

**`src/utils/capitalize.ts`** - Simple utility function that:
- Capitalizes the first letter of a string
- Handles empty strings (returns empty string)
- Uses `charAt(0).toUpperCase() + str.slice(1)` pattern

**`src/utils/capitalize.test.ts`** - 6 tests covering:
- Basic capitalization (`hello` → `Hello`)
- Single character (`a` → `A`)
- Empty string (`''` → `''`)
- Already capitalized string (`Hello` → `Hello`)
- Multiple words (`hello world` → `Hel
...(truncated)
