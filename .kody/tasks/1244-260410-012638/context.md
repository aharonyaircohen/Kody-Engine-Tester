
### taskify (2026-04-10T01:29:29)
{
"task_type": "feature",
"title": "Add CSV export utility",
"description": "Create `toCsv(rows: Record<string, string | number>[], columns?: string[]): string` in `src/utils/csv-export.ts`. Handle quoting for values containing commas. Include comprehensive tests covering basic export, column filtering, values with commas/quotes/newlines, and edge cases.",
"scope": ["src/utils/csv-export.ts", "src/utils/csv-export.test.ts"],
"risk_level": "low",
"existing_patterns": ["src/utils/flatten.ts - sing
...(truncated)

### build (2026-04-10T01:33:49)
Implementation complete. Created:

**`src/utils/csv-export.ts`** - CSV export utility with:
- `toCsv(rows, columns?)` function
- Handles values containing commas, quotes, newlines, and carriage returns
- Proper CSV escaping (quotes doubled, wrapped in quotes when needed)

**`src/utils/csv-export.test.ts`** - 14 tests covering:
- Basic export
- Column filtering
- Values with commas, quotes, newlines, carriage returns
- Numeric values
- Empty rows array
- Complex/mixed special characters
- Column 
...(truncated)
