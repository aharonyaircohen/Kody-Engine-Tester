
### taskify (2026-04-10T07:21:16)
```json
{
  "task_type": "feature",
  "title": "Add sanitizeInput function to src/middleware/sanitize.ts",
  "description": "Create `sanitizeInput(input: string): string` in `src/middleware/sanitize.ts` that strips HTML tags, trims whitespace, and normalizes unicode. Include co-located tests in `sanitize.test.ts`.",
  "scope": ["src/middleware/sanitize.ts", "src/middleware/sanitize.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src/security/sanitizers.ts:14-33 — sanitizeHtml fun
...(truncated)

### build (2026-04-10T07:24:24)
Implementation complete. Summary:

**Created files:**
- `src/middleware/sanitize.ts` - Contains `sanitizeInput(input: string): string` function that:
  - Removes null bytes
  - Strips HTML tags using regex replacement
  - Trims leading/trailing whitespace
  - Normalizes unicode to NFC form

- `src/middleware/sanitize.test.ts` - 10 tests covering:
  - HTML tag stripping (preserves inner content)
  - Incomplete HTML tags
  - HTML tags with attributes
  - Whitespace trimming
  - Unicode normalizati
...(truncated)
