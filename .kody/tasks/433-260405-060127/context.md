
### taskify (2026-04-05T06:03:52)
{
  "task_type": "feature",
  "title": "Add format-currency utility with locale support",
  "description": "Create a currency formatting utility in src/utils/format-currency.ts that formats numbers as currency strings (USD, EUR, etc.) with locale support, following the existing format-number.ts pattern using Intl.NumberFormat. Add comprehensive tests in format-currency.test.ts.",
  "scope": [
    "src/utils/format-currency.ts",
    "src/utils/format-currency.test.ts"
  ],
  "risk_level": "low",

...(truncated)

### build (2026-04-05T06:08:59)
Done. Created:

1. **`src/utils/format-currency.ts`** - Currency formatting utility using `Intl.NumberFormat` with:
   - `FormatCurrencyOptions` interface with `currency`, `locale`, `showCurrencySymbol`, `useCurrencyCode` options
   - Default USD currency, en-US locale
   - Helper functions for symbol extraction and stripping

2. **`src/utils/format-currency.test.ts`** - 23 tests covering:
   - Basic USD formatting, large numbers, zero, negative values
   - Multiple currencies (EUR, GBP, JPY, CH
...(truncated)
