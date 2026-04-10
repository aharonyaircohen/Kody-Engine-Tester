
### taskify (2026-04-10T05:07:02)
Based on my exploration, I can now classify this task.

{
  "task_type": "chore",
  "title": "Verify auto-learn memory committed before ship stage",
  "description": "Test that auto-learn runs before ship stage, committing .kody/memory/ files to the PR branch. Verify via: (1) PR diff contains memory files (`gh pr diff <n> | grep \"^diff --git.*\\.kody/memory\"`), (2) run logs show auto-learn executes before ship stage. This is T35 validation per test-suite/agent.md.",
  "scope": [
    ".kody/wat
...(truncated)

### build (2026-04-10T05:10:48)

The fix is complete. Here's what I changed:

**Problem**: `autoLearn(ctx)` was called **after** all stages complete (line 188 in original), meaning it ran **after** the ship stage pushed the branch and created the PR. Memory files weren't included.

**Fix**: Moved `autoLearn(ctx)` to run **before** the ship stage (lines 131-134 in the new code):

```javascript
// Run auto-learn before ship stage so memory files are committed to PR
if (def.name === "ship") {
    autoLearn(ctx);
}
```

**New exec
...(truncated)
