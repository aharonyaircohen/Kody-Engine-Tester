
### taskify (2026-04-10T07:39:11)
Created `src/utils/broken-import.ts` with an import from `@/nonexistent/module` — this will intentionally fail at the verify (typecheck) stage as designed.


### build (2026-04-10T07:39:52)
**Verified**: `src/utils/broken-import.ts` is correctly implemented and fails at typecheck as designed.

The expected error is present:
```
src/utils/broken-import.ts(1,25): error TS2307: Cannot find module '@/nonexistent/module' or its corresponding type declarations.
```

The file contains:
1. An import from `@/nonexistent/module` (non-existent)
2. Exports a `brokenImport()` function that returns the non-existent import

This intentionally fails TypeScript verification as per the task requirem
...(truncated)
