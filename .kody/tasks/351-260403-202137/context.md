
### taskify (2026-04-03T20:23:39)
{
  "task_type": "feature",
  "title": "Add formatDate utility function",
  "description": "Add a `formatDate(date: Date, format: string): string` utility function to `src/utils/` supporting formats: `YYYY-MM-DD`, `MM/DD/YYYY`, `DD MMM YYYY`. Export from new `src/utils/index.ts` barrel file and add unit tests following existing patterns.",
  "scope": [
    "src/utils/format-date.ts",
    "src/utils/format-date.test.ts",
    "src/utils/index.ts"
  ],
  "risk_level": "low",
  "existing_patterns": 
...(truncated)

### build (2026-04-03T20:24:46)
Done. Created the `formatDate` utility function with all 9 tests passing and typecheck clean.

**Summary:**
- `src/utils/format-date.ts` - FormatDateOptions interface + formatDate function supporting `YYYY-MM-DD`, `MM/DD/YYYY`, `DD MMM YYYY`
- `src/utils/format-date.test.ts` - 9 tests covering all three formats, zero-padding, and month abbreviations
- `src/utils/index.ts` - barrel file exporting `formatDate`

