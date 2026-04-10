
### build (2026-04-10T12:12:10)
The fix is complete. I've created `src/utils/helpers.ts` with the proper default export.

**Summary of changes:**
- Created `src/utils/helpers.ts` with:
  - `deepMerge` function for deep object merging
  - `groupBy` function for grouping arrays by key
  - `isEmpty` utility for checking empty values
  - `helpers` factory function as the **default export** (`export default helpers`)

The file passes TypeScript type checking and is now available for import with both named exports and the default ex
...(truncated)
