# [run-20260409-2355] T14: UI task with MCP auto-inject

## Task
Test that UI tasks get MCP Playwright auto-injected.

## Context
Create a UI-focused task: "Add a new dashboard page with charts and data tables in src/app/dashboard/page.tsx".

## Verification
1. After @kody on the issue, check task.json for hasUI: true
2. Check logs for MCP Playwright server configuration
3. If hasUI: false but task is clearly UI, the taskify classifier needs tuning

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1198-260410-001144` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24219654287))

To rerun: `@kody rerun 1198-260410-001144 --from <stage>`

