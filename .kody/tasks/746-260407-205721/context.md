
### taskify (2026-04-07T20:59:58)
{
"task_type": "feature",
"title": "Add CSV export utility",
"description": "Create `toCsv(rows: Record<string, string | number>[], columns?: string[]): string` in `src/utils/csv-export.ts` that converts an array of objects to CSV format. Must handle quoting for values containing commas (wrap in double quotes, escape internal double quotes with double double quotes). Include comprehensive tests in `csv-export.test.ts` covering basic export, custom column ordering, values with commas, values with
...(truncated)

### build (2026-04-07T21:06:01)
Implementation complete. Created:

**`src/utils/csv-export.ts`** - `toCsv(rows, columns?)` function that:
- Converts array of objects to CSV string
- Handles custom column ordering via optional `columns` param
- Quotes values containing commas, quotes, or newlines
- Escapes internal double quotes by doubling them

**`src/utils/csv-export.test.ts`** - 9 tests covering all requirements:
- Basic export, custom column ordering, values with commas, values with quotes, combined edge cases, empty array
...(truncated)
