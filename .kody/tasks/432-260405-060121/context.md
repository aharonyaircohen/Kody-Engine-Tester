
### taskify (2026-04-05T06:03:39)
{
  "task_type": "feature",
  "title": "Add format-date utility with ISO, relative, and locale formats",
  "description": "Create src/utils/format-date.ts with a formatDate function that supports three modes: ISO string output via toISOString(), relative time (e.g. '2 hours ago') using Intl.RelativeTimeFormat, and locale-aware date formatting via Intl.DateTimeFormat. Add comprehensive tests in src/utils/format-date.test.ts following the existing format-number pattern.",
  "scope": ["src/utils/fo
...(truncated)

### build (2026-04-05T06:06:19)
Done. Created both files following the existing `format-number` pattern:

**`src/utils/format-date.ts`** - 17 tests pass, zero TypeScript errors
- `FormatDateOptions` interface with `format`, `locale`, `relativeStyle`, `localeOptions`, `referenceDate`
- `formatDate(date, options?)` supporting three modes:
  - `'iso'` → `toISOString()`
  - `'relative'` → `Intl.RelativeTimeFormat` (e.g., "2 hours ago")
  - `'locale'` → `Intl.DateTimeFormat` (default, e.g., "1/15/2024")

**`src/utils/format-date.te
...(truncated)
