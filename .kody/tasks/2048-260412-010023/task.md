# Add .kody/memory.md and file tree to taskify stage context injection

## Context
The taskify stage of the Kody pipeline is missing project memory and file tree in its context injection. The standalone `kody taskify` command correctly includes `.kody/memory.md` content and `git ls-files` output in `projectContext`, but the pipeline's `buildFullPromptTiered` function (src/context.ts) reads project memory from `.kody/memory/` directory and does not include file tree at all.

The issue is in `buildFullPromptTiered` which calls `readProjectMemoryTiered` that only reads from `.kody/memory/` directory. It does not fall back to `.kody/memory.md` and does not include the file tree.

## Acceptance Criteria
- `.kody/memory.md` content is included in the taskify stage prompt (not just `.kody/memory/` directory)
- File tree (from `git ls-files`) is included in the taskify stage prompt
- No raw `{{TASK_CONTEXT}}` or other template tokens appear in the final prompt
- The fix follows the same pattern as the standalone `kody taskify` command (see lines 6370-6388 in cli.js)

## Test Strategy
1. After implementing the fix, run `kody-engine run --issue-number 2023 --from taskify` to execute just the taskify stage
2. Capture the prompt sent to the LLM (check Claude Code logs or engine logs)
3. Verify the prompt contains:
   - Content from `.kody/memory.md` (e.g., "TypeScript strict mode", "conventional commits", "Vitest testing")
   - File tree output from `git ls-files`
4. Verify no `{{TASK_CONTEXT}}` placeholder remains unreplaced
5. Alternatively, run the full pipeline and check `.kody/tasks/<task-id>/` for generated files

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-12):
@kody

**@aharonyaircohen** (2026-04-12):
🚀 Kody pipeline started: `2048-260412-010023` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24295442937))

