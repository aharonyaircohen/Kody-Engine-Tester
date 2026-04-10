
### taskify (2026-04-10T16:30:35)
Created `src/utils/broken-import.ts` with an import from `@/nonexistent/module` — this will fail at verify/typecheck as intended.


### build (2026-04-10T16:31:10)
**Verification complete.** The implementation is correct:

**Error confirmed:**
```
src/utils/broken-import.ts(1,25): error TS2307: Cannot find module '@/nonexistent/module' or its corresponding type declarations.
```

The file `src/utils/broken-import.ts` is properly implemented:
- Imports from non-existent path `@/nonexistent/module`
- Re-exports the non-existent import
- Fails at typecheck with TS2307 as intended

This will trigger the contradiction detection workflow when rerun with `@kody r
...(truncated)
