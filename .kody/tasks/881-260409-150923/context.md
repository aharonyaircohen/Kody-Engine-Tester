
### taskify (2026-04-09T15:12:24)
Created `src/utils/broken-import.ts` with an import from `@/nonexistent/module` which will fail at typecheck.

```json
{
  "task_type": "chore",
  "title": "Create broken-import.ts utility",
  "description": "Create src/utils/broken-import.ts that imports from @/nonexistent/module — this will fail at verify (typecheck) stage as intended for testing contradiction detection",
  "scope": ["src/utils/broken-import.ts"],
  "risk_level": "low",
  "existing_patterns": ["src/utils/debounce.ts — single-f
...(truncated)

### build (2026-04-09T15:12:48)
The file `src/utils/broken-import.ts` already exists with the intended broken import from `@/nonexistent/module`. The task is complete - the file exports `getBrokenImport()` which imports a non-existent module, which will cause a typecheck failure at verify stage.

