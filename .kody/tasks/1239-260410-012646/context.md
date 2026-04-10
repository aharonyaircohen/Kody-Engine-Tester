
### taskify (2026-04-10T01:29:12)

{
  "task_type": "chore",
  "title": "Create broken-import.ts utility",
  "description": "Create src/utils/broken-import.ts that imports from @/nonexistent/module. This will intentionally fail at typecheck/verify step, then rerun with @kody rerun to trigger contradiction detection.",
  "scope": ["src/utils/broken-import.ts"],
  "risk_level": "low",
  "existing_patterns": ["src/utils/*.ts - single-function utility files following simple naming conventions"],
  "questions": []
}


### build (2026-04-10T01:29:53)
The file was created successfully. The typecheck confirms the expected error:

```
src/utils/broken-import.ts(1,29): error TS2307: Cannot find module '@/nonexistent/module' or its corresponding type declarations.
```

**Summary:**
- Created `src/utils/broken-import.ts` with an intentional broken import from `@/nonexistent/module`
- TypeScript correctly fails with TS2307 (module not found)
- Ready for the `@kody rerun` step to trigger contradiction detection

