
### build (2026-04-07T18:30:19)
**Implementation complete.** I've created the `truncateString` utility function:

**`src/utils/truncate-string.ts`**:
- Function: `truncateString(str: string, maxLength: number, ellipsis: string = '...'): string`
- Returns string unchanged if length <= maxLength
- Truncates to `maxLength - ellipsis.length` and appends ellipsis when truncating
- Default ellipsis: `...` (3 chars)
- Handles edge cases: empty string, null/undefined, negative maxLength, zero maxLength

**`src/utils/truncate-string.te
...(truncated)
