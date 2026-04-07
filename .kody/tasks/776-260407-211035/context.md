
### taskify (2026-04-07T21:12:49)
{
  "task_type": "chore",
  "title": "Create broken-import utility for testing",
  "description": "Create `src/utils/broken-import.ts` with an intentional broken import from `@/nonexistent/module` to test contradiction detection and verify failure handling",
  "scope": ["src/utils/broken-import.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src/utils/sleep.ts — simple utility module with exports"
  ],
  "questions": []
}


### build (2026-04-07T21:13:07)
Created `src/utils/broken-import.ts` with an intentional broken import from `@/nonexistent/module`. This will fail at typecheck/verify time as expected.

