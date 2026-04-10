
### taskify (2026-04-10T18:04:07)
{
  "task_type": "chore",
  "title": "Create broken-import utility for contradiction detection testing",
  "description": "Created src/utils/broken-import.ts that imports from @/nonexistent/module. This file intentionally contains a broken import to test the contradiction detection system when the pipeline is rerun after verify failure.",
  "scope": ["src/utils/broken-import.ts"],
  "risk_level": "low",
  "existing_patterns": ["src/utils/debounce.ts - simple utility file pattern with single func
...(truncated)

### build (2026-04-10T18:04:48)
The file `src/utils/broken-import.ts` is already correctly set up with the broken import. The typecheck confirms the error:

```
src/utils/broken-import.ts(1,29): error TS2307: Cannot find module '@/nonexistent/module' or its corresponding type declarations.
```

The task is complete. The file:
1. Imports from `@/nonexistent/module` (a module that doesn't exist)
2. Exports a function `getNonexistent()` that returns the nonexistent import
3. This causes a typecheck failure, which should trigger c
...(truncated)
