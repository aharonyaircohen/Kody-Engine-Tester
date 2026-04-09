# feat: add isNumber type guard utility

Add a simple isNumber(value: unknown): value is number type guard to src/utils/number.ts. Include unit tests using Vitest.

---

## Discussion (3 comments)

**@aguyaharonyair** (2026-04-09):
Testing MCP integration with kody.config.json MCP enabled.

Expected in logs (build stage):
- `MCP servers enabled for build`

Check: kody.config.json now has:
```json
"mcp": {
  "enabled": true,
  "servers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./"]
    }
  },
  "stages": ["build", "verify", "review", "review-fix"]
}
```

**@aguyaharonyair** (2026-04-09):
@kody run

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `run` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24197264875))

To rerun: `@kody rerun run --from <stage>`

