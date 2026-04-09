
### taskify (2026-04-09T22:28:35)
{
  "task_type": "feature",
  "title": "Add CSV export utility",
  "description": "Create `toCsv(rows: Record<string, string | number>[], columns?: string[]): string` in `src/utils/csv-export.ts`. Handle quoting for values containing commas. With tests following the existing utility pattern.",
  "scope": ["src/utils/csv-export.ts", "src/utils/csv-export.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src/utils/flatten.ts - single-function utility with JSDoc, follows identical pat
...(truncated)

### build (2026-04-09T22:30:45)
Implementation complete. Created:

- **`src/utils/csv-export.ts`** — `toCsv(rows, columns?)` function with proper CSV escaping (commas, quotes, newlines)
- **`src/utils/csv-export.test.ts`** — 8 tests covering basic conversion, column ordering, comma handling, quote escaping, newline handling, empty rows, numeric values, and missing values

All tests pass.

