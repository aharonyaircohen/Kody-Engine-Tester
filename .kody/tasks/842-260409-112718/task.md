# feat: Verify MCP server integration for build/verify stages

## Description
Verify that MCP (Model Context Protocol) servers can be configured in kody.config.json and used during build/verify stages. MCP servers extend Kody's toolset with dynamic capabilities.

## Acceptance Criteria
- [ ] MCP servers can be configured in `kody.config.json` under `mcp.servers`
- [ ] `buildMcpConfigJson()` generates valid MCP JSON config
- [ ] `isMcpEnabledForStage()` correctly gates MCP to build/verify/review stages
- [ ] `withPlaywrightIfNeeded()` auto-injects playwright MCP for UI tasks
- [ ] Pipeline passes `mcpConfigJson` to the agent runner
- [ ] Log output shows "MCP servers enabled for {stage}" during pipeline run

## MCP Configuration
Add to `kody.config.json`:
```json
"mcp": {
  "enabled": true,
  "stages": ["build", "verify", "review"],
  "servers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-filesystem", "./src"]
    }
  }
}
```

## Test Verification
After adding the MCP config and running:
```bash
kody run --issue <this-issue-number>
```
Check log output for:
```
MCP servers enabled for build
MCP servers enabled for verify
```