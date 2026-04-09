
### taskify (2026-04-09T17:40:06)
{
  "task_type": "feature",
  "title": "Add sanitizeInput utility function",
  "description": "Create `sanitizeInput(input: string): string` in `src/middleware/sanitize.ts` that strips HTML tags, trims whitespace, and normalizes unicode. Include comprehensive tests covering HTML stripping, whitespace handling, unicode normalization, and edge cases.",
  "scope": [
    "src/middleware/sanitize.ts",
    "src/middleware/sanitize.test.ts"
  ],
  "risk_level": "low",
  "existing_patterns": [
    "src/
...(truncated)

### build (2026-04-09T17:42:30)
The TypeScript errors are pre-existing in the codebase and unrelated to my changes. My implementation is complete:

**Created files:**
- `src/middleware/sanitize.ts` - `sanitizeInput(input: string): string` that strips HTML tags, trims whitespace, and normalizes unicode via NFD
- `src/middleware/sanitize.test.ts` - 24 tests covering HTML stripping, whitespace handling, unicode normalization, edge cases, and combined operations

All 24 tests pass.

