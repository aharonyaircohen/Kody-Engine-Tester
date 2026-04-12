# Verify: taskify context injection

## Result: Verification Complete

The taskify stage context injection was verified against the acceptance criteria.

## Acceptance Criteria Status

| Criterion | Status | Notes |
|-----------|--------|-------|
| Project memory content from `.kody/memory.md` appears in taskify stage logs | ❌ FAILS (pipeline) | `buildFullPromptTiered` reads from `.kody/memory/` directory instead |
| File tree appears in taskify stage logs | ❌ FAILS (pipeline) | `buildFullPromptTiered` does not include `git ls-files` output |
| No raw `{{ }}` template tokens appear in taskify stage logs | ✅ PASSES | Template tokens are correctly replaced |

## Root Cause

The issue is in `buildFullPromptTiered` function in `src/context.ts` (kody-engine):

- **Pipeline mode** (`buildFullPromptTiered`): Reads project memory from `.kody/memory/` directory via `readProjectMemoryTiered()`. Does NOT include file tree.
- **Standalone mode** (cli.js lines 6370-6388): Correctly reads from `.kody/memory.md` AND includes `git ls-files` output as `projectContext`.

The `readProjectMemoryTiered` function (cli.js line 3903) only looks in `.kody/memory/` directory and does not fall back to `.kody/memory.md`.

## Evidence

1. **`.kody/memory.md`** exists with project conventions (TypeScript strict mode, conventional commits, Vitest testing)
2. **`.kody/steps/taskify.md`** has `{{TASK_CONTEXT}}` placeholder at line 105
3. **Standalone `kody taskify`** (cli.js lines 6370-6388) correctly includes both `.kody/memory.md` content and `git ls-files` output
4. **`buildFullPromptTiered`** (cli.js line 12132) calls `readProjectMemoryTiered` which only reads from `.kody/memory/` directory

## Impact

- Pipeline taskify runs miss project conventions that should inform task classification
- File tree context is missing from pipeline taskify prompts
- This affects all pipeline runs using the taskify stage

## Resolution

This issue requires a fix in the kody-engine itself to make `buildFullPromptTiered` behave consistently with the standalone `kody taskify` command by:
1. Also reading from `.kody/memory.md` as a fallback
2. Including `git ls-files` output as part of the project context