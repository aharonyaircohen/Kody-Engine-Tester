# feat: MCP server integration for build/verify stages

## Description
Verify that MCP servers configured in `kody.config.json` are passed to the agent during build/verify stages.

## Setup
Add to `kody.config.json` before running:
```json
"mcp": {
  "enabled": true,
  "servers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-filesystem", "./src"]
    }
  },
  "stages": ["build", "verify"]
}
```

## Verification
Check pipeline log for:
```
MCP servers enabled for build
MCP servers enabled for verify
```

## How to test
Comment `@kody run` on this issue to trigger CI pipeline.

---

## Discussion (4 comments)

**@aguyaharonyair** (2026-04-09):
Testing MCP integration — check logs for MCP servers enabled in build/verify stages

**@aguyaharonyair** (2026-04-09):
@kody run

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `run` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24194986072))

To rerun: `@kody rerun run --from <stage>`

**@aharonyaircohen** (2026-04-09):
⚡ **Complexity: low** — skipping plan, review, review-fix (not needed for low-risk tasks)

