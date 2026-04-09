
### taskify (2026-04-09T14:47:21)
```json
{
  "task_type": "feature",
  "title": "Add capitalize utility function",
  "description": "Create capitalize(str: string): string utility in src/utils/string.ts that uppercases the first character and lowercases the rest of the string. Unit tests should cover: basic capitalization, already capitalized strings, empty string, single character, and strings with spaces.",
  "scope": ["src/utils/string.ts", "src/utils/string.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src
...(truncated)

### build (2026-04-09T14:49:33)
The TypeScript errors are pre-existing in the project and unrelated to my changes. My new files have no errors.

**Summary:**

Created `src/utils/string.ts` with the `capitalize` function:
```typescript
export function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
```

Created `src/utils/string.test.ts` with 5 unit tests covering:
- Basic capitalization (`"hello"` → `"Hello"`)
- Already capitalized strings (`"Hello"` 
...(truncated)
