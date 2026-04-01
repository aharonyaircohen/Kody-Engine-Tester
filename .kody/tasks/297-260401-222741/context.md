
### build (2026-04-01T22:40:41)
The implementation is complete. Here's a summary:

**Created files:**

1. **`src/utils/truncate.ts`** - Utility function with TypeScript types:
   - `truncate(str, maxLen, suffix='...')` truncates a string to `maxLen` total characters (content + suffix)
   - Handles edge cases: empty strings, null/undefined, negative maxLen, maxLen smaller than suffix

2. **`src/utils/truncate.test.ts`** - 13 unit tests covering:
   - Basic truncation with default and custom suffix
   - Strings unchanged when sh
...(truncated)
