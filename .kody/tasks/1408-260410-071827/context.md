
### taskify (2026-04-10T07:21:27)
{
  "task_type": "feature",
  "title": "Add CSV export utility",
  "description": "Create `toCsv(rows: Record<string, string | number>[], columns?: string[]): string` in `src/utils/csv-export.ts`. Handle quoting for values containing commas. With tests. The function should accept an array of row objects and an optional array of column keys, and return a CSV-formatted string with proper comma and quote handling.",
  "scope": ["src/utils/csv-export.ts", "src/utils/csv-export.test.ts"],
  "risk_lev
...(truncated)

### build (2026-04-10T07:24:08)
Implementation complete. I've created:

**`src/utils/csv-export.ts`** - The CSV export utility with:
- `toCsv(rows, columns?)` function that converts array of objects to CSV string
- Proper quoting for values containing commas, double quotes, or newlines
- Double quotes escaped by doubling them per CSV spec
- Optional column parameter to control column order and selection

**`src/utils/csv-export.test.ts`** - 14 tests covering:
- Empty array handling
- Single/multiple row conversion
- Column ord
...(truncated)
