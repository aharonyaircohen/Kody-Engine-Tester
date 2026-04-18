
### taskify (2026-04-18T18:50:21)
{"task_type":"chore","title":"Verify bare @kody uses issue title as PR title","description":"Verified that bare @kody correctly uses the GitHub issue title as the PR title with a conventional commit prefix. The ship stage in @kody-ade/engine@0.4.4 constructs the PR title as `${prefix}: ${issue_title}` where: (1) `prefix` is derived from `task_type` in task.json (feature→feat, bugfix→fix, etc., defaulting to chore), and (2) `issue_title` is extracted from the `# ` heading in task.md, which is pop
...(truncated)

### build (2026-04-18T18:51:30)
The implementation is confirmed working. Here's my verification summary:

---

## Verification: `@kody` uses issue title as PR title ✅

**Implementation path confirmed in `@kody-ade/engine@0.4.4` (`cli.js`):**

### Step 1 — Pipeline init (line 19705)
When `@kody` runs on a GitHub issue, it fetches the issue and writes its title to the top of `task.md`:
```javascript
let taskContent = `# ${issue.title}\n\n${issue.body ?? ""}`;
```
For this issue (#2826), `task.md` correctly starts with:
```
# [ru
...(truncated)
