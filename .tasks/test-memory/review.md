## Verdict: PASS

## Summary
Created a `formatDate` utility function (`src/utils/format-date.ts`) that converts a `Date` object to ISO `YYYY-MM-DD` format using `toISOString().slice(0, 10)`, with 5 TDD tests. Also updated `vitest.config.mts` to discover unit tests in `src/**/*.test.ts`.

## Findings

### Critical
None.

### Major
**Timezone sensitivity**: `toISOString()` converts to UTC before formatting. A `new Date('2025-03-25')` parsed in a timezone behind UTC (e.g., UTC-5) will be interpreted as `2025-03-24T19:00:00Z` and return `'2025-03-24'`. The tests pass because the jsdom environment runs in UTC, but in a browser or Node server with a local timezone offset, results will differ for dates near midnight.

If the intent is "format the local calendar date the user is in", the implementation should use `getFullYear()`, `getMonth()`, and `getDate()` instead of `toISOString()`.

### Minor
- No test for an invalid date (`new Date('invalid')`) — currently returns `'NaN-NaN-Na'`. If callers may pass invalid dates, an explicit test (and optional guard) would be useful.
