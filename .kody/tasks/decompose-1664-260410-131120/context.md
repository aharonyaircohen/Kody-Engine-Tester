
### taskify (2026-04-10T13:14:21)
```json
{
  "task_type": "chore",
  "title": "Verify decompose simple task fallback",
  "description": "Verifies that @kody decompose on a simple task (adding capitalize-first.ts utility) falls back to normal pipeline. Checks: complexity_score < 4 OR not decomposable, fallback via runPipeline(), PR created normally, and logs show 'Delegating to normal pipeline' or similar message. This is T24 of the Kody test suite.",
  "scope": [
    ".kody/tasks/decompose-1664-260410-131120/status.json",
    "
...(truncated)

### build (2026-04-10T13:17:54)
The implementation is complete. Here's a summary:

**Created files:**

1. **`src/utils/capitalize-first.ts`** - A utility function that capitalizes only the first letter of a string, leaving the rest unchanged:
   ```typescript
   export function capitalizeFirst(str: string): string {
     if (!str) return str
     return str.charAt(0).toUpperCase() + str.slice(1)
   }
   ```

2. **`src/utils/capitalize-first.test.ts`** - 7 test cases covering:
   - Capitalizing first letter only
   - Single wor
...(truncated)
