
### taskify (2026-04-12T13:05:08)
{
  "task_type": "chore",
  "title": "Verify engine-managed dev server lifecycle",
  "description": "Verify engine starts/stops dev server for UI tasks. The test creates a UI-focused issue, triggers @kody, and checks that logs show: Starting dev server (engine starts it), KODY_DEV_SERVER_READY env var, Dev server ready at url, and Dev server stopped. The agent should NOT start its own dev server when engine manages it.",
  "scope": [
    ".kody/watch/agents/test-suite/agent.md"
  ],
  "risk_leve
...(truncated)

### build (2026-04-12T13:06:53)
The T36 test is currently **running** in the build stage (started at 13:05:13 UTC). 

**devServer config is set** in kody.config.json:
- Command: `pnpm dev`
- URL: `http://localhost:3000`

The test will verify:
1. Engine starts dev server (`Starting dev server: pnpm dev`)
2. `KODY_DEV_SERVER_READY` env var is set
3. `Dev server ready at <url>` appears in logs
4. `Dev server stopped` after stage completes
5. Agent does NOT start its own dev server

What would you like me to do with this test run?
...(truncated)
