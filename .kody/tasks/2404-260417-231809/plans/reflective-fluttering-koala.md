# Plan: Add formatDate utility function in dateUtils.ts

## Context

The task is to create a new, simpler `formatDate` utility function with signature `formatDate(date: Date, locale: string): string` in `src/utils/dateUtils.ts`, distinct from the existing `src/utils/format-date.ts` which uses a more complex `FormatDateOptions` object. The new utility provides a lightweight, direct wrapper around `Intl.DateTimeFormat`. JSDoc and co-located unit tests are required.

## Files to Create

### 1. `src/utils/dateUtils.ts`

```typescript
/**
 * Formats a date using Intl.DateTimeFormat with the given locale.
 *
 * @example
 * formatDate(new Date('2024-01-15T10:30:00Z'), 'en-US')  // "1/15/2024"
 * formatDate(new Date('2024-01-15T10:30:00Z'), 'de-DE')  // "15.1.2024"
 */
export function formatDate(date: Date, locale: string): string {
  if (!isValidDate(date)) {
    return String(date)
  }
  const formatter = new Intl.DateTimeFormat(locale)
  return formatter.format(date)
}

function isValidDate(date: Date): boolean {
  return date instanceof Date && !Number.isNaN(date.getTime())
}
```

Key decisions:
- Named export `formatDate` following camelCase utility convention
- Direct `Intl.DateTimeFormat` usage (no custom options) for simplicity
- Reuses `isValidDate` guard pattern from `format-date.ts`
- Returns `String(date)` for invalid dates (consistent with existing `format-date.ts` behavior)

### 2. `src/utils/dateUtils.test.ts`

Follow the same vitest `describe/it/expect` structure from `src/utils/format-date.test.ts`:
- Freeze time with `vi.useFakeTimers()` / `vi.setSystemTime()`
- Reset with `vi.useRealTimers()` in `afterEach`
- Test cases: default en-US locale, de-DE locale, invalid date, epoch date, far future date

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { formatDate } from './dateUtils'

describe('formatDate', () => {
  const frozenNow = new Date('2024-06-15T12:00:00Z')

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(frozenNow)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('locale formatting', () => {
    it('formats a date with en-US locale', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      expect(formatDate(date, 'en-US')).toBe('1/15/2024')
    })

    it('formats a date with de-DE locale', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      expect(formatDate(date, 'de-DE')).toBe('15.1.2024')
    })

    it('formats a date with fr-FR locale', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      expect(formatDate(date, 'fr-FR')).toBe('15/01/2024')
    })
  })

  describe('edge cases', () => {
    it('handles invalid Date object', () => {
      const invalidDate = new Date('invalid')
      expect(formatDate(invalidDate, 'en-US')).toBe('Invalid Date')
    })

    it('handles epoch date', () => {
      const epoch = new Date(0)
      expect(formatDate(epoch, 'en-US')).toBeTruthy()
    })

    it('handles far future date', () => {
      const farFuture = new Date('2099-12-31T23:59:59Z')
      expect(formatDate(farFuture, 'en-US')).toContain('2099')
    })
  })
})
```

## Verification

1. Run `pnpm tsc --noEmit` — confirm zero type errors
2. Run `pnpm test` — all vitest tests pass including new `dateUtils.test.ts`

## Critical Files

- `src/utils/format-date.ts` — reference for `isValidDate` pattern
- `src/utils/format-date.test.ts` — reference for vitest test structure
- `src/utils/dateUtils.ts` — **new file to create**
- `src/utils/dateUtils.test.ts` — **new file to create**
