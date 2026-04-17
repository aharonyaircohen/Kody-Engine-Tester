# Plan: `formatDate` Utility Function + Co-located Tests

## Context

The task requires adding a new `formatDate` utility function to `src/utils/dateUtils.ts` using `Intl.DateTimeFormat`, with a co-located vitest test suite at `src/utils/dateUtils.test.ts` covering multiple locales and edge cases. This is a low-risk task: 2 new files, no existing code affected.

## Approach

### File 1: `src/utils/dateUtils.ts`
- Single function: `formatDate(date: Date, locale: string): string`
- Uses `Intl.DateTimeFormat` with `year: 'numeric'`, `month: 'numeric'`, `day: 'numeric'` options
- Returns the formatted string
- Includes JSDoc with `@example` block
- Follows existing utility patterns (e.g., `format-currency.ts`)

### File 2: `src/utils/dateUtils.test.ts`
- Co-located vitest test suite using `describe`/`it`/`expect`
- Uses `vi.useFakeTimers()` + `vi.setSystemTime()` for deterministic date testing
- Covers: en-US, de-DE, fr-FR, ja-JP, en-GB locales; epoch date; far future; invalid Date

## Implementation Steps

1. **Create `src/utils/dateUtils.ts`** — write the function with JSDoc
2. **Create `src/utils/dateUtils.test.ts`** — write the vitest test suite
3. **Run tests** — `pnpm test:int --run src/utils/dateUtils.test.ts`
4. **Type-check** — `pnpm tsc --noEmit`

## Critical Files
- New: `src/utils/dateUtils.ts`
- New: `src/utils/dateUtils.test.ts`
- Reference: `src/utils/format-currency.ts` (identical pattern, JSDoc style)
- Reference: `src/utils/format-currency.test.ts` (test structure to follow)

## Verification
```bash
pnpm test:int --run src/utils/dateUtils.test.ts
pnpm tsc --noEmit
```
All tests must pass with zero type errors.
