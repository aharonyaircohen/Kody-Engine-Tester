
### taskify (2026-04-09T22:08:31)
```json
{
  "task_type": "chore",
  "title": "Add broken import utility",
  "description": "Create `src/utils/broken-import.ts` that imports from `@/nonexistent/module`. This file is intentionally broken to fail at verify/typecheck stage, enabling contradiction detection testing when running `@kody rerun`.",
  "scope": ["src/utils/broken-import.ts"],
  "risk_level": "low",
  "existing_patterns": ["src/utils/debounce.ts - single-function utility module pattern; src/utils/sleep.ts - simple utility
...(truncated)

### build (2026-04-09T22:09:28)
Created `src/utils/broken-import.ts` with the intentional broken import from `@/nonexistent/module`. 

The TypeScript check confirms the expected error:
```
src/utils/broken-import.ts(1,29): error TS2307: Cannot find module '@/nonexistent/module' or its corresponding type declarations.
```

This file is intentionally broken to fail at the typecheck/verify stage. The task is complete.

