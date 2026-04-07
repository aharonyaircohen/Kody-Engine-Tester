
### taskify (2026-04-07T20:20:53)
{
  "task_type": "feature",
  "title": "Add sanitizeInput middleware function",
  "description": "Create `sanitizeInput(input: string): string` in `src/middleware/sanitize.ts` that strips HTML tags, trims whitespace, and normalizes unicode. With comprehensive tests.",
  "scope": [
    "src/middleware/sanitize.ts",
    "src/middleware/sanitize.test.ts"
  ],
  "risk_level": "low",
  "existing_patterns": [
    "src/middleware/validation.ts - middleware utility pattern with NextRequest/NextResponse 
...(truncated)

### build (2026-04-07T20:23:54)
Done. Here's a summary of what was implemented:

**Created `src/middleware/sanitize.ts`** with `sanitizeInput(input: string): string` that:
- Strips HTML tags and decodes HTML entities (using existing `sanitizeHtml`)
- Trims leading/trailing whitespace
- Normalizes unicode (NFC composition)
- Removes null bytes

**Created `src/middleware/sanitize.test.ts`** with 30 comprehensive tests covering:
- HTML stripping (script injection, XSS attacks, event handlers)
- Whitespace trimming (spaces, tabs, 
...(truncated)
