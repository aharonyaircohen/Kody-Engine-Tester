
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

### autofix (2026-04-10T12:13:25)

The TypeScript errors in `src/app/(frontend)/pages`, `src/pages/contacts/`, and other files are **pre-existing issues** unrelated to the hotfix changes. They involve:

1. `.next/` build output validation errors (Next.js Pages Router config)
2. Type narrowing issues with `searchParams` being possibly null
3. Missing fields in user seed helper
4. Bad types file

My fix is complete:

**Fixed:** Changed `let context` to `const context` on line 80 of `src/utils/logger/index.ts`. The variable was nev
...(truncated)
