
### taskify (2026-04-03T22:04:47)
{
  "task_type": "feature",
  "title": "Add string capitalize utility",
  "description": "Create src/utils/string-capitalize.ts with a function that capitalizes only the first letter of an entire string (e.g., 'hello world' → 'Hello world'), distinct from capitalizeWords which capitalizes each word. Add corresponding test file following existing test patterns.",
  "scope": [
    "src/utils/string-capitalize.ts",
    "src/utils/string-capitalize.test.ts"
  ],
  "risk_level": "low",
  "existing_pa
...(truncated)

### build (2026-04-03T22:06:30)
**Implementation complete.** Created two files:

1. **`src/utils/string-capitalize.ts`** - Capitalizes only the first letter of the entire string:
   ```typescript
   export function stringCapitalize(str: string): string {
     if (!str) return str
     return str.charAt(0).toUpperCase() + str.slice(1)
   }
   ```

2. **`src/utils/string-capitalize.test.ts`** - 6 tests covering: basic capitalization, single word, empty string, already capitalized, leaving rest of string unchanged, and single cha
...(truncated)
