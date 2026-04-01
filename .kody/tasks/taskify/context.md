
### taskify (2026-04-01T15:36:12)
Now let me classify this task. The issue is about testing/validating that `@kody taskify` properly injects project memory and file tree into context. This is a test/validation task (chore) since it validates existing functionality rather than implementing new features.

```json
{
  "task_type": "chore",
  "title": "Validate taskify context injection with memory file",
  "description": "Test that @kody taskify properly injects project memory (.kody/memory.md with tRPC/Prisma conventions) and file
...(truncated)

### build (2026-04-01T16:17:23)
Based on my analysis, I found a **context injection failure**:

**Validation Results:**

| Check | Status |
|-------|--------|
| Memory content appears in taskify logs | ✗ FAILED |
| File tree appears in taskify logs | ✗ FAILED |
| No raw `{{` template tokens | ✗ FAILED |

**Evidence:**

The `.kody/steps/taskify.md` prompt file contains a raw `{{TASK_CONTEXT}}` template token at line 683 that was **not replaced** with actual context content before being sent to the agent.

This means:
1. The `.k
...(truncated)
