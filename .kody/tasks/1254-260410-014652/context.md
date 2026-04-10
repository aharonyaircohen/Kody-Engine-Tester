
### taskify (2026-04-10T01:49:31)
{
  "task_type": "feature",
  "title": "Add pluralize utility function",
  "description": "Create a pluralize utility function in `src/utils/pluralize.ts` that returns singular or plural form based on count, with support for irregular plurals via an options object. Function signature: `pluralize(word: string, count: number, options?: { irregular?: Record<string, string> }): string`. Add comprehensive tests in `src/utils/pluralize.test.ts` covering basic singular/plural, irregular plurals, and ed
...(truncated)

### build (2026-04-10T01:51:41)
Implementation complete. Created:

1. **`src/utils/pluralize.ts`** - The `pluralize` function that:
   - Returns singular form when count === 1
   - Returns word + 's' when count !== 1
   - Supports irregular plurals via `options.irregular`

2. **`src/utils/pluralize.test.ts`** - 9 tests covering:
   - Singular form (count = 1)
   - Plural form (count != 1)
   - Count of 0
   - Negative counts
   - Irregular plurals
   - Fallback to regular plural when irregular not found
   - Empty strings
   -
...(truncated)
