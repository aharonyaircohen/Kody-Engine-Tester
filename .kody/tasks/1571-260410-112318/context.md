
### taskify (2026-04-10T11:35:53)
Created `src/utils/broken-import.ts` with an import from `@/nonexistent/module` — this will fail at the verify (typecheck) stage, triggering contradiction detection on rerun.


### build (2026-04-10T11:36:26)
**Verification complete.** The file `src/utils/broken-import.ts` exists with the intended broken import:

```typescript
import { something } from "@/nonexistent/module";
export const brokenImport = something;
```

**Typecheck result:** The broken import correctly fails with:
```
src/utils/broken-import.ts(1,27): error TS2307: Cannot find module '@/nonexistent/module' or its corresponding type declarations.
```

This is the expected behavior - the import from `@/nonexistent/module` fails at verif
...(truncated)
