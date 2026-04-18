# Plan: Add formatDate utility function with tests

## Context

The task asks to create `src/utils/dateUtils.ts` with `formatDate(date: Date, locale: string): string`
and `src/utils/dateUtils.test.ts` with unit tests using vitest. However, `src/utils/format-date.ts`
already exists with a full-featured `formatDate` implementation using `Intl.DateTimeFormat`, and
`src/utils/format-date.test.ts` already has comprehensive tests using `vi.useFakeTimers()`.

**Decision**: Create the new files as specified (`dateUtils.ts` / `dateUtils.test.ts`) as a focused,
simple wrapper that matches the exact `(date: Date, locale: string): string` signature. This is
consistent with the task scope and the codebase naming convention (files are kebab-case, so
`dateUtils.ts` is acceptable as an exception for a non-utility-module name). The existing
`format-date.ts` remains untouched.

## Files to Create

### 1. `src/utils/dateUtils.ts`

```typescript
/**
 * Formats a date using Intl.DateTimeFormat with the given locale.
 *
 * @param date  - The Date object to format
 * @param locale - The locale string (e.g. 'en-US', 'de-DE')
 * @returns A locale-formatted date string (e.g. "1/15/2024" for en-US)
 */
export function formatDate(date: Date, locale: string = 'en-US'): string {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return String(date)
  }
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(date)
}
```

### 2. `src/utils/dateUtils.test.ts`

Follow the same patterns as `truncate.test.ts` and `format-date.test.ts`:
- `import { describe, it, expect } from 'vitest'`
- Named `describe('formatDate', ...)` blocks
- Test cases:
  - Formats a date with default locale (en-US)
  - Formats a date with de-DE locale
  - Formats a date with fr-FR locale
  - Handles invalid Date object (returns `String(date)`)
  - Handles epoch date (Date(0))

## Verification

```bash
pnpm test:int -- src/utils/dateUtils.test.ts
pnpm tsc --noEmit
```

## Implementation Order

1. Write `src/utils/dateUtils.ts`
2. Write `src/utils/dateUtils.test.ts`
3. Run `pnpm test:int -- src/utils/dateUtils.test.ts`
4. Run `pnpm tsc --noEmit`
