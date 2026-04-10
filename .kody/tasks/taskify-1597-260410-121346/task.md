# [run-20260410-1200] T22: Taskify with context

## Test Case T22: Taskify with context argument\n\n**Command:** \n\n**Purpose:** Verify that taskify can create a task linked to an external ticket.\n\n**Test Method:**\n1. Create a temp issue\n2. Trigger \n3. Verify Kody creates a task linked to the ticket ID\n4. Cleanup\n\n**Success Criteria:** Task is created with ticket reference\n\n**Labels:** test-suite-temp, test-phase-1\n\n**Complexity:** low

---

## Discussion (6 comments)

**@aharonyaircohen** (2026-04-10):
@kody taskify

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `taskify-1597-260410-121346` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24242327146))

Kody is decomposing issue #1597 description into tasks...

**@aharonyaircohen** (2026-04-10):
Kody has questions before decomposing ****:

1. The 'Command' field in the issue is empty. What is the exact command to trigger for T22? For example: '@kody taskify --ticket-id <ID>', '@kody taskify --file <path> --context <ticket>', or something else?
2. The title says 'context argument' but the test method describes creating a temp issue and verifying a task is linked to a ticket ID. Does 'context argument' mean: (a) passing project memory/file tree as context to taskify, or (b) passing a ticket ID as context to link the created task to an external ticket?
3. Step 2 says 'Trigger' but doesn't specify what to trigger. Should this be 'Trigger @kody taskify' on the temp issue, or something else?

Reply with `@kody approve` and your answers to proceed.

**@aharonyaircohen** (2026-04-10):
@kody approve

1. Use: @kody taskify --ticket JIRA-123
2. Context means (b): passing ticket ID as context to link created task to external ticket
3. Trigger @kody taskify --ticket JIRA-123 on the temp issue

**@aharonyaircohen** (2026-04-10):
@kody approve

1. Exact command: @kody taskify --ticket JIRA-123 (the ticket ID as the context argument)
2. Context means (b): passing ticket ID as context to link the created task to an external ticket
3. Trigger: @kody taskify --ticket JIRA-123 on the temp issue

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `taskify-1597-260410-121346` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24242627896))

To rerun: `@kody rerun taskify-1597-260410-121346 --from <stage>`

