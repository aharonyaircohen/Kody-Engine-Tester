# Verify taskify context injection with project memory

## Context
This task validates that the taskify stage correctly injects project memory and file tree context when processing a ticket. The `.kody/memory.md` file already exists with project conventions. The taskify prompt template at `.kody/steps/taskify.md` includes a `{{TASK_CONTEXT}}` placeholder that should be replaced with memory content and file tree before being sent to the LLM.

## Acceptance Criteria
- [ ] Project memory content (from `.kody/memory.md`) appears in taskify stage logs
- [ ] File tree appears in taskify stage logs
- [ ] No raw `{{ }}` template tokens appear in taskify stage logs

## Test Strategy
1. Run the taskify stage (e.g., via `@kody taskify --file <ticket-file>` or through the pipeline)
2. Capture the taskify stage logs
3. Verify the logs contain:
   - Project conventions from `.kody/memory.md` (e.g., TypeScript strict mode, conventional commits, Vitest testing)
   - A representation of the file tree structure
   - No `{{TASK_CONTEXT}}` or other raw template tokens
4. If any verification fails, the context injection mechanism needs debugging

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-12):
@kody full

**@aharonyaircohen** (2026-04-12):
🚀 Kody pipeline started: `2023-260412-005018` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24295283794))

