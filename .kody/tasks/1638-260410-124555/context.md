
### taskify (2026-04-10T12:48:30)
{
  "task_type": "chore",
  "title": "Create broken-import utility for testing",
  "description": "Created `src/utils/broken-import.ts` that imports from `@/nonexistent/module` — a deliberately broken import to test the contradiction detection pipeline. The file will fail typecheck at verify stage.",
  "scope": ["src/utils/broken-import.ts"],
  "risk_level": "low",
  "existing_patterns": [],
  "questions": []
}


### build (2026-04-10T12:48:54)
The file `src/utils/broken-import.ts` already exists with the broken import from `@/nonexistent/module`. This is the intended state - the file will fail typecheck at the verify stage.

The task is complete. The broken import will:
1. Fail at the typecheck/verify stage (importing from a non-existent module)
2. After failure, rerunning with `@kody rerun` will trigger contradiction detection

