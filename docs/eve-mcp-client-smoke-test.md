# Eve MCP Client Smoke Test

A short three-step checklist to verify Codex can start an Eve agent through the authenticated MCP connection and retrieve its result.

## Checklist

- [ ] **Connect an MCP client to Eve Studio** — authenticate the MCP client to Eve Studio (no credentials in this file) and confirm the connection succeeds.
- [ ] **List and choose a published agent** — from the connected MCP client, list the published agents in Eve Studio and select one to use.
- [ ] **Start a task and check its result** — dispatch a task to the chosen agent via the MCP client and verify the result is returned successfully.
