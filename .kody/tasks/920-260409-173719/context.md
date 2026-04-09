
### taskify (2026-04-09T17:41:24)
{
  "task_type": "feature",
  "title": "Add CSV export utility",
  "description": "Create `toCsv(rows: Record<string, string | number>[], columns?: string[]): string` in `src/utils/csv-export.ts` that exports data to CSV format. Must handle quoting for values containing commas. Include comprehensive tests.",
  "scope": ["src/utils/csv-export.ts", "src/utils/csv-export.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src/utils/capitalize-words.ts + capitalize-words.test.ts — single
...(truncated)

### build (2026-04-09T17:43:41)
Done. Created:

1. **`src/utils/csv-export.ts`** - `toCsv(rows, columns?)` function that:
   - Exports array of objects to CSV string
   - Handles custom column ordering when `columns` array provided
   - Quotes values containing commas, double quotes, or newlines
   - Escapes double quotes by doubling them

2. **`src/utils/csv-export.test.ts`** - 12 comprehensive tests covering:
   - Basic export, custom column order, commas/quotes/newlines in values
   - Numeric values, empty arrays, missing v
...(truncated)
