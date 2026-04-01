
### taskify (2026-04-01T22:28:57)
{
  "task_type": "feature",
  "title": "Add number formatting utility",
  "description": "Add a formatNumber(n, options) utility in src/utils/format-number.ts that formats numbers with locale-aware thousands separators and configurable decimal places. Include TypeScript types and unit tests.",
  "scope": ["src/utils/format-number.ts", "src/utils/format-number.test.ts"],
  "risk_level": "low",
  "questions": []
}


### build (2026-04-01T22:31:30)
Implementation complete. Here's a summary:

**Created `src/utils/format-number.ts`**:
- `formatNumber(n, options)` utility with TypeScript interface `FormatNumberOptions`
- Supports configurable decimal places (default: 2)
- Locale-aware thousands/decimal separators using `Intl.NumberFormat`
- Custom separator overrides
- Handles edge cases: NaN, Infinity, -Infinity

**Created `src/utils/format-number.test.ts`**:
- 19 tests covering basic formatting, locale support, custom separators, and edge c
...(truncated)
