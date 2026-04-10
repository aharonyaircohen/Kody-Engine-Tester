
### taskify (2026-04-10T16:23:29)
Created `src/utils/broken-import.ts` with a broken import from `@/nonexistent/module`. This will fail at typecheck/verify as intended.


### build (2026-04-10T16:24:09)
The file `src/utils/broken-import.ts` is correctly implemented and verified. The typecheck output confirms the expected error:

```
src/utils/broken-import.ts(1,27): error TS2307: Cannot find module '@/nonexistent/module' or its corresponding type declarations.
```

The file contains:
```typescript
import { something } from '@/nonexistent/module'

export function getBrokenImport(): string {
  return something
}
```

This is intentionally broken as specified in the task - it imports from a non-ex
...(truncated)
