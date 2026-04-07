
### taskify (2026-04-07T20:59:52)
```json
{
  "task_type": "feature",
  "title": "Add input sanitizer middleware",
  "description": "Create `sanitizeInput(input: string): string` in `src/middleware/sanitize.ts` that strips HTML tags, trims whitespace, and normalizes unicode. Add co-located tests in `sanitize.test.ts`.",
  "scope": [
    "src/middleware/sanitize.ts",
    "src/middleware/sanitize.test.ts"
  ],
  "risk_level": "low",
  "existing_patterns": [
    "src/utils/slugify.ts - uses `normalize('NFD')` and `replace(/[\\u0300
...(truncated)

### build (2026-04-07T21:02:44)
Implementation complete. Here's a summary:

**Created files:**

1. **`src/middleware/sanitize.ts`** - The sanitizer function that:
   - Strips HTML tags using regex
   - Normalizes unicode (NFD) and strips diacritics (following the pattern from `slugify.ts`)
   - Trims whitespace
   - Collapses multiple whitespace into single space

2. **`src/middleware/sanitize.test.ts`** - 13 co-located tests covering:
   - HTML tag stripping
   - Whitespace trimming
   - Unicode normalization and diacritic st
...(truncated)
