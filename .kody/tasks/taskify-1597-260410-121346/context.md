
### taskify (2026-04-10T12:25:48)
Now I understand the task. T22 is testing the existing `--ticket` flag functionality in the taskify command. The feature is already implemented - this test verifies it works correctly.

Based on my exploration:

**What the feature does:** When you run `@kody taskify --ticket JIRA-123`, the engine fetches the external ticket using MCP tools and uses its content as the spec to decompose into tasks.

**The test:**
1. Create a temp issue
2. Trigger `@kody taskify --ticket JIRA-123` on the temp issue
...(truncated)

### build (2026-04-10T12:36:15)
## T22 Test Execution Complete

I've executed the T22 verification test for the `taskify --ticket` flag. Here's the summary:

### Test Executed
```bash
kody-engine taskify --ticket JIRA-123 --issue-number 1627
```

### Key Findings

**Critical Bug Discovered**: When running `@kody taskify --ticket <external-ticket-id>`:

1. The engine correctly enters "ticket" mode and posts "Kody is decomposing ticket **JIRA-123**..."
2. **BUG**: The engine does NOT actually fetch the external JIRA ticket
3. In
...(truncated)
