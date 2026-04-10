# [run-20260410-0437] T14: UI task with MCP auto-inject

## Task
Test that UI tasks auto-inject Playwright MCP configuration.

## Precondition
mcp.devServer must be configured in kody.config.json (currently NOT configured - this test may fail on precondition)

## Task Description
Add a new search bar component to the header navigation in src/components/SearchBar.tsx with proper styling.

## Test Steps
1. Create this UI-focused temp issue
2. Comment @kody
3. Verify: task.json has hasUI: true
4. Verify: Playwright MCP auto-injected in logs

## Expected
- hasUI: true in task.json for UI tasks
- MCP auto-injected when hasUI=true

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1329-260410-044514` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24226814716))

To rerun: `@kody rerun 1329-260410-044514 --from <stage>`

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1329-260410-050410` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24227317927))

To rerun: `@kody rerun 1329-260410-050410 --from <stage>`

