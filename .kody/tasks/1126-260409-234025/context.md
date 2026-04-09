
### taskify (2026-04-09T23:43:12)
Created `src/utils/broken-import.ts` with an import from `@/nonexistent/module` — this will fail at typecheck as expected.


### build (2026-04-09T23:43:45)
The file `src/utils/broken-import.ts` is correctly implemented with the broken import. The typecheck shows the expected error:

```
src/utils/broken-import.ts(1,29): error TS2307: Cannot find module '@/nonexistent/module' or its corresponding type declarations.
```

The task is complete — no additional work needed. The file exists with the intended content that fails at typecheck as expected.

