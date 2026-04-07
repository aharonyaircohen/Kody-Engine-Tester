
### taskify (2026-04-07T18:29:31)
{
  "task_type": "chore",
  "title": "Verify PR title uses issue title with type prefix",
  "description": "Test T15b verifies that when the Kody pipeline runs via @kody command, the resulting PR title uses the issue title with a type prefix in 'feat: <issue title>' format rather than an LLM-generated verbose title. This is a verification task that creates a temp issue, triggers the pipeline, and checks the PR title format.",
  "scope": [
    ".kody/tasks/591-260407-182455/task.md",
    ".kody/t
...(truncated)

### build (2026-04-07T18:41:39)
I've completed my analysis for the build stage. Here's a summary:

## Task: T15b - Verify PR title uses issue title with type prefix

### Analysis Result: FAIL

The verification task expects PR titles to follow the format `feat: <issue title>`, but the current Kody Engine implementation does not produce this format.

**Expected PR title:**
```
feat: [run-20260407-1802] T15b: PR title from issue title
```

**Actual PR title (based on ship.js code analysis):**
```
chore: Verify PR title uses issue
...(truncated)
