
### taskify (2026-04-07T19:48:58)
Created `src/utils/broken-import.ts` with an intentional broken import from `@/nonexistent/module`. This will fail at typecheck/verify stage as intended for the contradiction detection workflow.


### build (2026-04-07T19:49:34)
**Task Verified Complete**

The file `src/utils/broken-import.ts` already exists with the intentional broken import:

```typescript
import { broken } from '@/nonexistent/module'

export function useBrokenImport(): string {
  return broken
}
```

The typecheck confirms the expected error:
```
src/utils/broken-import.ts(1,24): error TS2307: Cannot find module '@/nonexistent/module' or its corresponding type declarations.
```

This will fail at the verify stage as intended for the contradiction det
...(truncated)
