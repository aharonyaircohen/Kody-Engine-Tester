
### taskify (2026-04-07T19:30:56)
Based on my exploration, this is the T15 test task from the Kody test-suite. Here's my classification:

```json
{
  "task_type": "feature",
  "title": "Verify PR title uses issue title with type prefix",
  "description": "Test that when Kody creates a PR from an issue, the PR title is `<type>: <issue title>` (e.g., `feat: [run-20260407-1908] T15: PR title from issue title`) rather than an LLM-generated verbose summary. Issue #637 already created; pipeline run 24100073445 is currently in progress
...(truncated)

### build (2026-04-07T19:49:35)
**T15 Final Status: INCOMPLETE**

Updated status.json to reflect the stuck pipeline state.

| Field | Value |
|-------|-------|
| **Task State** | incomplete |
| **Issue** | #637 |
| **Problem** | Pipeline stuck at build stage 50+ min |
| **PR Created** | No |
| **Evidence of Working** | PR #605 (from run-1802) confirms correct PR title format |

**Recommendation:** T15 should be marked `MANUAL_REVIEW` - the PR title sourcing feature itself works correctly (proven by PR 605), but the current tes
...(truncated)
