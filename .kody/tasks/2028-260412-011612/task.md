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

## Discussion (12 comments)

**@aharonyaircohen** (2026-04-12):
@kody full

**@aharonyaircohen** (2026-04-12):
🚀 Kody pipeline started: `2028-260412-005024` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24295284896))

**@aharonyaircohen** (2026-04-12):
🚀 Kody pipeline started: `2028-260412-005024`

To rerun: `@kody rerun 2028-260412-005024 --from <stage>`

**@aharonyaircohen** (2026-04-12):
❌ Pipeline crashed: Pipeline already running (PID 2712)

**@aharonyaircohen** (2026-04-12):
🚀 Kody pipeline started: `2028-260412-005024`

Kody is decomposing issue #2028 description into tasks...

**@aharonyaircohen** (2026-04-12):
Kody decomposed **** into 1 task(s):

- [#2050](https://github.com/aharonyaircohen/Kody-Engine-Tester/issues/2050) — Verify taskify context injection mechanism

> Auto-triggered `@kody` on each issue.

**@aharonyaircohen** (2026-04-12):
🚀 Kody pipeline started: `test-verify`

Kody is decomposing issue #2028 description into tasks...

**@aharonyaircohen** (2026-04-12):
## Pipeline Summary: `2028-260412-005024`

| Stage | Status | Duration | Retries |
|-------|--------|----------|---------|
| taskify | failed | - | 1 |
| plan | pending | - | 0 |
| build | pending | - | 0 |
| verify | pending | - | 0 |
| review | pending | - | 0 |
| review-fix | pending | - | 0 |
| ship | pending | - | 0 |

**Total:** 0s | **Model:** MiniMax-M2.7-highspeed

**@aharonyaircohen** (2026-04-12):
❌ Pipeline failed at **taskify**: Exit code 143


**@github-actions** (2026-04-12):
❌ Pipeline failed. [View logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24295284896)

**@aharonyaircohen** (2026-04-12):
@kody full

**@aharonyaircohen** (2026-04-12):
🚀 Kody pipeline started: `2028-260412-011612` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24295694765))

