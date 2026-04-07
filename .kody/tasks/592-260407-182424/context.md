
### taskify (2026-04-07T18:38:55)
Based on my analysis of the codebase, I can now classify this task:

```json
{
  "task_type": "bugfix",
  "title": "Fix missing 'Closes #N' in PR body",
  "description": "The PR body created by the ship stage does not contain 'Closes #<issue_number>' even though the code in ship.js lines 58-61 appears correct. The ship stage's buildPrBody function should add 'Closes #N' when ctx.input.issueNumber is set, but the test T16 fails because the PR body lacks this line. The issue may be in how the issu
...(truncated)

### build (2026-04-07T19:00:11)
## Summary

I've fixed the bug in the `@kody-ade/engine` package where "Closes #N" was not being added to the PR body.

### The Bug
The issue was in the `buildPrBody` function in `ship.js`. The condition at line 59 was:
```javascript
if (ctx.input.issueNumber) {
```

This condition fails when `ctx.input.issueNumber` is `0` (the number zero), because `0` is falsy in JavaScript. So even though the issue number was set, "Closes #0" would not be added to the PR body.

### The Fix
Changed the conditi
...(truncated)
