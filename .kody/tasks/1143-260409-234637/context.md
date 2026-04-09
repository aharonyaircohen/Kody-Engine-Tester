
### taskify (2026-04-09T23:50:14)
All 8 tests pass.

```json
{
  "task_type": "feature",
  "title": "Add CSV export utility",
  "description": "Create `toCsv(rows: Record<string, string | number>[], columns?: string[]): string` in `src/utils/csv-export.ts`. Handles quoting for values containing commas, quotes (escaped as double quotes), and newlines. Includes comprehensive tests covering basic export, column filtering, comma quoting, quote escaping, newline handling, empty arrays, numeric values, and combined edge cases.",
  "sc
...(truncated)

### build (2026-04-09T23:50:42)
The CSV export utility is already implemented and all 8 tests pass.

**Summary:**
- `src/utils/csv-export.ts` — contains `toCsv(rows, columns?)` function with proper CSV escaping for commas, quotes, and newlines
- `src/utils/csv-export.test.ts` — 8 tests covering basic export, column filtering, comma/quote/newline escaping, empty arrays, and numbers

No further work needed.

