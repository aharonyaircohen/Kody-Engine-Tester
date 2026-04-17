# Plan: Add CSV Parser Utility

## Context

The task is to add a CSV parser utility to `src/utils/` following the established single-function + co-located test pattern used throughout the codebase. The implementation must:
- Parse CSV text into structured data (array of arrays, or array of objects with headers)
- Handle quoted fields (commas inside quotes)
- Support custom delimiters (comma, semicolon, tab)
- Handle CRLF line endings
- Use `Result<T, E = Error>` from `src/utils/result.ts` with `ok()` / `err()` factory functions
- Error variants: `'EMPTY_INPUT' | 'UNCLOSED_QUOTE' | 'INCONSISTENT_COLUMNS'` (all string literals)

## Files to Create

### `src/utils/csvParser.ts`
```typescript
import { ok, err, type Result } from './result'

export type ParseOptions = {
  delimiter?: string      // default: ','
  hasHeaders?: boolean    // default: true
  skipEmpty?: boolean     // default: false
}

export function parseCsv(input: string, options?: ParseOptions): Result<ParsedData, CsvError>
export type ParsedData = string[][] | Record<string, string>[]
export type CsvError = 'EMPTY_INPUT' | 'UNCLOSED_QUOTE' | 'INCONSISTENT_COLUMNS'
```

### `src/utils/csvParser.test.ts`
Test cases following the `slugify.test.ts` pattern (describe/it/expect, no semicolons, single quotes):
- Empty string
- Single row
- Multiple rows with headers → array of objects
- Multiple rows without headers → array of arrays
- Fields containing commas (quoted)
- Custom delimiter (semicolon, tab)
- CRLF line endings
- Mixed quote styles
- Inconsistent column count
- Single quoted field

## Implementation Details

- Use the existing `Result<T, E>` discriminated union from `src/utils/result.ts`
- JSDoc comments for the function and types (following `slugify.ts` pattern)
- Single-responsibility: one exported function, internal helpers as needed
- No side effects (pure function)

## Verification

1. Run `pnpm tsc --noEmit` — zero type errors
2. Run `pnpm test:int src/utils/csvParser.test.ts` — all tests pass
3. Verify the file is placed at `src/utils/csvParser.ts` and `src/utils/csvParser.test.ts`
