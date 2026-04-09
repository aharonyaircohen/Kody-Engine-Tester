
### taskify (2026-04-09T22:29:08)
{
  "task_type": "feature",
  "title": "Add input sanitizer middleware",
  "description": "Create `sanitizeInput(input: string): string` in `src/middleware/sanitize.ts` that strips HTML tags, trims whitespace, and normalizes unicode. Include comprehensive tests in `src/middleware/sanitize.test.ts`.",
  "scope": [
    "src/middleware/sanitize.ts",
    "src/middleware/sanitize.test.ts"
  ],
  "risk_level": "low",
  "existing_patterns": [
    "src/utils/debounce.ts — single-function utility module 
...(truncated)

### build (2026-04-09T22:32:02)
**Implementation complete.**

Created `src/middleware/sanitize.ts` with `sanitizeInput(input: string): string` that:
- Strips HTML tags using regex `/<[^>]*>/g`
- Normalizes unicode to NFC form
- Converts newlines/tabs/carriage returns to spaces
- Removes dangerous control characters (`\u0000-\u001F` and `\u007F-\u009F`)
- Trims leading/trailing whitespace
- Collapses multiple whitespace into single spaces

Created `src/middleware/sanitize.test.ts` with 12 tests covering all functionality.

Test
...(truncated)
