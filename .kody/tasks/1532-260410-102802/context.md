
### taskify (2026-04-10T10:30:44)
Created `src/utils/broken-import.ts` with an import from `@/nonexistent/module` — this will fail typecheck as expected.


### build (2026-04-10T10:31:18)
**Verified**: `src/utils/broken-import.ts` exists with the expected broken import that fails typecheck.

**Status:**
- File: `src/utils/broken-import.ts` ✓
- Broken import from `@/nonexistent/module` ✓
- TypeScript error confirmed: `TS2307: Cannot find module '@/nonexistent/module'`

The task is complete. The file was already created with the intentional broken import that will fail verification.

