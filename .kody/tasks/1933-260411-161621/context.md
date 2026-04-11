
### taskify (2026-04-11T16:23:55)

{
  "task_type": "feature",
  "title": "Add formatHelpers utility module with formatBytes, truncateMiddle, and slugify",
  "description": "Create a new utility module `src/utils/formatHelpers.ts` with three functions: `formatBytes` to convert bytes to human-readable format (KB, MB, GB), `truncateMiddle` to truncate strings with ellipsis in the middle, and `slugify` to convert text to URL-safe slugs. Include full TypeScript types, JSDoc comments, and co-located tests in `src/utils/formatHelpers.
...(truncated)

### build (2026-04-11T16:33:23)
All tests pass. Here's a summary of what was implemented:

## Summary

Created two new files:

### `src/utils/formatHelpers.ts`
- **`formatBytes(bytes, options)`** - Converts bytes to human-readable format (B, KB, MB, GB, TB, PB)
  - Uses binary units (1024) by default, decimal (1000) with `{ decimal: true }`
  - Returns "0 B" for negative/NaN values
  - Uses 0 decimals for MB+ to avoid precision loss
  
- **`truncateMiddle(str, maxLen, ellipsis)`** - Truncates strings with ellipsis in the middl
...(truncated)
