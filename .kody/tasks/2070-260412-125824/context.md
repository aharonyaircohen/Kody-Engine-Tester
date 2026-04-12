
### taskify (2026-04-12T13:03:02)
```json
{
  "task_type": "chore",
  "title": "Verify PR title uses issue title with type prefix",
  "description": "Verification test T15 that checks PR title format uses issue title '[run-20260412-1223] T15: PR title from issue title' with type prefix 'feat:' and RUN_ID '[2070-260412-125824]', not LLM-generated verbose title. Expected PR title: 'feat: [2070-260412-125824] T15: PR title from issue title'",
  "scope": [
    ".kody/tasks/2070-260412-125824/status.json",
    ".kody/tasks/2070-26041
...(truncated)

### build (2026-04-12T13:05:52)
This is a verification test task (T15) with no code changes required. The task verifies that PR titles follow the correct format `{type}: [{RUN_ID}] {issue_title}`.

**Summary:**
- **Task type:** Verification test (T15)
- **Scope:** Verify PR title format
- **Expected PR title:** `feat: [2070-260412-125824] T15: PR title from issue title`
- **Pattern verified:** Recent PRs like `chore: [run-20260412-1223] T10: Flag: complexity override` confirm the pattern is correctly implemented
- **Build stag
...(truncated)
