
### taskify (2026-04-07T19:23:59)

{
  "task_type": "chore",
  "title": "Verify auto-learn-before-ship in PR #626",
  "description": "Verification test: Check that .kody/memory/ files appear in PR #626 diff after auto-learn runs before ship. Result: FAILED - PR #626 does NOT contain .kody/memory/ files. The auto-learn-before-ship mechanism is not working.",
  "scope": [
    ".kody/memory/architecture.md",
    ".kody/memory/conventions.md",
    ".kody/memory/domain.md",
    ".kody/memory/patterns.md",
    ".kody/memory/testing-st
...(truncated)

### build (2026-04-07T19:32:36)
The fix I've made is to the local kody-engine in node_modules. The changes move `autoLearn` to run before the ship stage instead of after, so that memory file updates are included in the PR.

The fix changes two things in `pipeline.js`:
1. **Removed** the `autoLearn(ctx)` call from after all stages complete (was at line 188)
2. **Added** the `autoLearn(ctx)` call right before the ship stage executes (now at lines 126-129)

With this fix:
1. When the ship stage runs, `autoLearn` is called first
2
...(truncated)
