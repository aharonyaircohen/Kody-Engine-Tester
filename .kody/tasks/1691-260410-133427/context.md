
### taskify (2026-04-10T13:44:56)
Created `src/utils/broken-import.ts` with an intentional broken import from `@/nonexistent/module`. The typecheck fails as expected with `error TS2307: Cannot find module '@/nonexistent/module'`.

This file will:
1. Fail at verify stage (typecheck)
2. After `@kody rerun`, trigger contradiction detection as described in the task


### build (2026-04-10T13:45:32)
**Verification complete.** The file `src/utils/broken-import.ts` exists with:

1. **Broken import**: `import nonexistent from '@/nonexistent/module'`
2. **Export**: `export const brokenImport = { module: nonexistent };`
3. **TypeScript error**: `src/utils/broken-import.ts(1,25): error TS2307: Cannot find module '@/nonexistent/module'`

The implementation is correct and the typecheck fails as expected. No changes needed — this is a verification task.

