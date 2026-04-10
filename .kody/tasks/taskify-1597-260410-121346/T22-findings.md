# T22 Test Findings: taskify --ticket flag

## Test Executed

Ran: `kody-engine taskify --ticket JIRA-123 --issue-number 1627`

## What Happened

1. Engine entered "ticket" mode with ticketId="JIRA-123"
2. Posted comment: "Kody is decomposing ticket **JIRA-123** into tasks..."
3. Created issue #1630 titled "Add T22 test case to kody-test-suite"
4. Posted comment: "Kody decomposed **JIRA-123** into 1 task(s)"

## Critical Issue Found

**The engine did NOT actually fetch the JIRA-123 ticket.**

The configured MCP server is `filesystem` (for local file access), which cannot fetch external JIRA tickets. The filesystem MCP server is also only enabled for `["build", "verify", "review", "review-fix"]` stages, not for `taskify`.

Instead of failing with an error when it cannot fetch the external ticket, the engine silently fell back to using the issue #1627 description as the spec.

## Evidence

- `taskify.marker` contains `{"ticketId":"JIRA-123","issueNumber":1627}` showing ticket mode was active
- `taskify-result.json` contains task based on issue #1627 description, NOT from a JIRA ticket
- The task body mentions "Test case T22 verifies the `@kody taskify --ticket JIRA-123` command" - this is from issue #1627, not from JIRA

## Bug Description

When running `@kody taskify --ticket <external-ticket-id>`:
1. Engine sets mode="ticket" and stores ticketId
2. Engine posts "Kody is decomposing ticket **<ticket-id>**..."
3. MCP tool is invoked to fetch the external ticket
4. **BUG**: If MCP fetch fails or returns no content, engine falls back to issue description instead of failing
5. Engine creates task based on fallback content, not actual ticket

## Expected Behavior

When in ticket mode and MCP fetch fails:
- Engine should fail with error: "Could not fetch ticket <ticket-id>. Ensure MCP server is configured for external ticketing system."
- Engine should NOT claim to be decomposing a ticket if it cannot fetch it

## Test Result

**PARTIAL PASS** - Task was created with "JIRA-123" reference in body, but:
- The reference is only in the text, not an actual link
- The JIRA ticket was never actually fetched
- Test criteria "linked to external ticket" is not truly satisfied