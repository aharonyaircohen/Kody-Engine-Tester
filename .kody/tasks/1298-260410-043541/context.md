
### taskify (2026-04-10T04:38:21)
Based on my exploration, I can now classify this task.

```json
{
  "task_type": "feature",
  "title": "Add CSV export utility",
  "description": "Create `toCsv(rows: Record<string, string | number>[], columns?: string[]): string` in `src/utils/csv-export.ts`. Handle quoting for values containing commas. With tests in `csv-export.test.ts`.",
  "scope": [
    "src/utils/csv-export.ts",
    "src/utils/csv-export.test.ts"
  ],
  "risk_level": "low",
  "existing_patterns": [
    "src/utils/truncate.
...(truncated)

### build (2026-04-10T04:40:32)
The implementation is complete. Here's a summary:

**Created files:**
- `src/utils/csv-export.ts` - The CSV export utility with JSDoc documentation
- `src/utils/csv-export.test.ts` - 14 tests covering all edge cases

**Implementation details:**
- `toCsv(rows, columns?)` converts an array of objects to CSV format
- Handles values containing commas, double quotes, or newlines by wrapping in double quotes
- Escapes internal double quotes by doubling them (`"` becomes `""`)
- Supports optional colum
...(truncated)
