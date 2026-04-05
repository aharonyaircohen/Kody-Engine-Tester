
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

### autofix (2026-04-05T06:13:18)
## Summary

**Root Cause:** The `Assignments` collection (`src/collections/Assignments.ts:18`) had a relationship field pointing to `'modules'` as the target collection, but no Payload collection with that slug existed. The `Modules.ts` file only contains an interface and in-memory store class, not a Payload collection configuration.

**Fix Applied:** Changed `relationTo: 'modules' as any` to `relationTo: 'courses'` - a valid collection in the Payload config.

**Verification Results:**
- `Invali
...(truncated)
