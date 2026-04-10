
### taskify (2026-04-10T14:41:18)
Created `src/utils/broken-import.ts` with an intentional broken import from `@/nonexistent/module`. This will fail at verify/typecheck stage.


### build (2026-04-10T14:41:49)
The file `src/utils/broken-import.ts` already exists with the intentionally broken import from `@/nonexistent/module`. The implementation is:

- Line 1: Broken import `import { something } from '@/nonexistent/module'`
- Lines 3-5: A function `brokenImport()` that returns the non-existent `something`

This is a test utility designed to fail at typecheck/verify stage for contradiction detection workflows. The implementation matches the task requirements.

