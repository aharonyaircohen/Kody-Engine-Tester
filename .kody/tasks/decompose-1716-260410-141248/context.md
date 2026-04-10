
### taskify (2026-04-10T14:15:37)
{
  "task_type": "feature",
  "title": "Add string capitalize utility function",
  "description": "Create string-capitalize.ts utility that capitalizes only the first letter of an entire string (not each word). Should follow the same pattern as cap.ts/capitalize. Include co-located tests in string-capitalize.test.ts.",
  "scope": [
    "src/utils/string-capitalize.ts",
    "src/utils/string-capitalize.test.ts"
  ],
  "risk_level": "low",
  "existing_patterns": [
    "src/utils/cap.ts - single-fu
...(truncated)

### build (2026-04-10T14:17:53)
Done. I've created the two files as requested:

**`src/utils/string-capitalize.ts`** - Capitalizes only the first letter of a string:
```typescript
export function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}
```

**`src/utils/string-capitalize.test.ts`** - 5 tests covering:
- Simple string capitalization
- Already capitalized strings  
- Empty string handling
- Single character
- String with spaces

All 5 tests pass. TypeScript c
...(truncated)
