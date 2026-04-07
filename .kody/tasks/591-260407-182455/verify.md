# Verification Report
## Result: FAIL

## Expected
- PR title format: `feat: <issue title>`
- PR title should be: `feat: [run-20260407-1802] T15b: PR title from issue title`

## Issue Information
- Issue #591 title: "[run-20260407-1802] T15b: PR title from issue title"
- Issue body specifies: Expected PR title is "feat: <issue title>" format

## Task Classification (from task.json)
- `task_type`: "chore"
- `title`: "Verify PR title uses issue title with type prefix"

## Actual PR Title (based on ship.js analysis)
The ship stage in `@kody-ade/engine` (ship.js:100-129) generates PR title as:
```
${TYPE_PREFIX[task.task_type]}: ${task.title}
```
For this task:
- `task.task_type` = "chore" → prefix = "chore" (not "feat")
- `task.title` = "Verify PR title uses issue title with type prefix"
- **Actual PR title**: `chore: Verify PR title uses issue title with type prefix`

## Discrepancy
| Aspect | Expected | Actual |
|--------|----------|--------|
| Prefix | `feat:` | `chore:` |
| Title | Issue title: `[run-20260407-1802] T15b: PR title from issue title` | task.title: `Verify PR title uses issue title with type prefix` |

## Root Cause
The ship stage derives PR title from `task.title` (in task.json) instead of the GitHub issue title. It also derives prefix from `task_type` mapping rather than using "feat:" consistently.

## Fix Required
Modify `@kody-ade/engine` ship stage to:
1. Fetch issue title via `getIssue(ctx.input.issueNumber)`
2. Use "feat:" prefix instead of deriving from task_type
3. Use issue title (not task.title) for the PR title body