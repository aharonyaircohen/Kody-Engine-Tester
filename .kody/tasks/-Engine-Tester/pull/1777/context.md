
### taskify (2026-04-10T17:28:21)
{"task_type":"feature","title":"Add broken import utility","description":"Create src/utils/broken-import.ts that imports from @/nonexistent/module. This file is intentionally broken to fail at verify/typecheck stage, used to test contradiction detection in the pipeline. The task is part of memory testing workflow.","scope":["src/utils/broken-import.ts"],"risk_level":"low","existing_patterns":["src/utils/debounce.ts - single-function utility file pattern with export statement","src/utils/result.t
...(truncated)

### build (2026-04-10T17:29:10)
The file `src/utils/broken-import.ts` has been created successfully. The typecheck confirms it fails as expected:

```
src/utils/broken-import.ts(1,37): error TS2307: Cannot find module '@/nonexistent/module' or its corresponding type declarations.
```

This is the intended behavior - the file intentionally imports from a non-existent module `@/nonexistent/module` to fail at the verify/typecheck stage for contradiction detection testing.

