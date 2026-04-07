
### taskify (2026-04-07T20:20:11)
{
  "task_type": "feature",
  "title": "Add CSV export utility",
  "description": "Create `toCsv(rows: Record<string, string | number>[], columns?: string[]): string` in `src/utils/csv-export.ts`. Handle quoting for values containing commas (values with commas must be wrapped in double quotes; double quotes within values must be escaped as double-double quotes). With comprehensive tests in `src/utils/csv-export.test.ts`.",
  "scope": ["src/utils/csv-export.ts", "src/utils/csv-export.test.ts"],
 
...(truncated)

### build (2026-04-07T20:21:26)
Done. Created `src/utils/csv-export.ts` with `toCsv` function that:

- Accepts `rows: Record<string, string | number>[]` and optional `columns?: string[]`
- Wraps values containing commas, double quotes, or newlines in double quotes
- Escapes internal double quotes as `""`
- Returns empty string for empty rows
- Handles missing columns by treating them as empty strings

Created `src/utils/csv-export.test.ts` with 10 comprehensive tests covering:
- Simple conversion, custom columns, comma escapin
...(truncated)
