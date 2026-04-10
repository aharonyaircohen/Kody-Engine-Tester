# Add T22 test case to kody-test-suite

## Context
Test case T22 verifies the `@kody taskify --ticket JIRA-123` command end-to-end. The `--ticket` flag is already implemented in kody-engine (taskify-ticket.md prompt with TICKET_ID mode). T22 is referenced as a post-check in T02 and T04 test sequences. This task adds T22 as a documented test case to the kody-test-suite.

## Acceptance Criteria
- T22 section added to kody-test-suite.md under Phase 2 or as a standalone test
- Test steps: (1) Create temp issue, (2) Trigger `@kody taskify --ticket JIRA-123` on the issue, (3) Verify Kody creates a task linked to the ticket ID, (4) Cleanup
- Success criteria: Task is created with ticket reference visible in task.json or task.md
- Labels: test-suite-temp, test-phase-1, complexity: low
- Verification uses gh CLI to check issue comments and task artifacts

## Test Strategy
Manual verification via gh CLI:
1. Create temp issue: `gh issue create --repo aharonyaircohen/Kody-Engine-Tester --title "[test-suite] T22: Taskify with context" --body "Testing @kody taskify --ticket JIRA-123"`
2. Comment `@kody taskify --ticket JIRA-123` on the temp issue
3. Wait for workflow completion
4. Verify: Check that the created task in `.kody/tasks/` contains ticket reference (JIRA-123) in task.md or task.json
5. Cleanup: Close/delete the temp issue

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1629-260410-123220` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24243052946))

To rerun: `@kody rerun 1629-260410-123220 --from <stage>`

