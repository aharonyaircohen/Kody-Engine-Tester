
### taskify (2026-04-10T04:17:58)
Created `src/utils/broken-import.ts` with an import from `@/nonexistent/module` — this will fail at typecheck/verify as intended.


### build (2026-04-10T04:18:31)
The file `src/utils/broken-import.ts` already exists with the broken import from `@/nonexistent/module`. The typecheck confirms the error:

```
src/utils/broken-import.ts(1,23): error TS2307: Cannot find module '@/nonexistent/module' or its corresponding type declarations.
```

The implementation is complete. The file was created as specified and fails at typecheck time as expected. After the first failure, running `@kody rerun` will trigger contradiction detection.

