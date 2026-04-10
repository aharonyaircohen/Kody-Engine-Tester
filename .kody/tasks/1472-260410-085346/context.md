
### taskify (2026-04-10T08:58:36)
Created `src/utils/broken-import.ts` with an import from `@/nonexistent/module` — this will fail at typecheck as intended for the contradiction detection workflow.


### build (2026-04-10T08:59:00)
The file `src/utils/broken-import.ts` already exists with the correct content:

```typescript
import nonexistent from '@/nonexistent/module';

export default nonexistent;
```

This imports from `@/nonexistent/module` which doesn't exist — it will fail at typecheck as intended for the contradiction detection workflow. The implementation is complete and working as specified.

