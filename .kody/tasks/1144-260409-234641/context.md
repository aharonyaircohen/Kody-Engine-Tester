
### taskify (2026-04-09T23:49:34)
{
  "task_type": "feature",
  "title": "Add sanitizeInput function to middleware",
  "description": "Create sanitizeInput(input: string): string in src/middleware/sanitize.ts that strips HTML tags, trims whitespace, and normalizes unicode to NFC form. Should reuse sanitizeHtml pattern from src/security/sanitizers.ts for HTML stripping and follow the unicode normalization approach from slugify.ts. Include co-located tests.",
  "scope": ["src/middleware/sanitize.ts", "src/middleware/sanitize.test.
...(truncated)

### build (2026-04-09T23:53:36)
My implementation is complete. Here's a summary:

**Created `src/middleware/sanitize.ts`:**
- `sanitizeInput(input: string): string` that:
  1. Removes null bytes (preventing null byte injection)
  2. Strips HTML tags via regex `<[^>]*>` (preventing XSS)
  3. Trims leading/trailing whitespace
  4. Normalizes unicode to NFC form (cross-platform consistency)

**Created `src/middleware/sanitize.test.ts`:**
- 16 tests covering all functionality (HTML stripping, null bytes, trimming, NFC normalizatio
...(truncated)
