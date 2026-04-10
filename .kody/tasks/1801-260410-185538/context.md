
### taskify (2026-04-10T18:58:06)
{
  "task_type": "chore",
  "title": "Add broken import utility",
  "description": "Create src/utils/broken-import.ts that imports from @/nonexistent/module. This file intentionally contains a broken import to trigger typecheck failure for contradiction detection testing.",
  "scope": ["src/utils/broken-import.ts"],
  "risk_level": "low",
  "existing_patterns": ["src/utils/debounce.ts - simple utility file with single export"],
  "questions": []
}


### build (2026-04-10T18:58:29)
Created `src/utils/brooken-import.ts` with an import from `@/nonexistent/module` — this will fail typecheck as expected. The task notes that after the first failure, you should run `@kody rerun` to trigger contradiction detection.

