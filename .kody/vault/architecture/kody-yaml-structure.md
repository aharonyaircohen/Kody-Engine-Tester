---
title: Executables
type: architecture
updated: 2026-05-05
sources:
  - https://github.com/aharonyaircohen/Kody-Engine-Tester/pull/3174
---

Executables are Kody's versioned action definitions: JSON profiles (`.kody/executables/*/profile.json`) paired with natural-language prompts (`.kody/executables/*/prompt.md`). The engine reads them at runtime and drives a Claude Code agent accordingly.

## Anatomy

```
.kody/executables/<name>/
  profile.json   — declarative config (name, role, schedule, inputs, tools, etc.)
  prompt.md     — agent instruction text
  cases.json    — (optional) for test-style executables; static test vectors
  <other inputs>
```

## Profile fields

| Field | Purpose |
|---|---|
| `name` | Unique executable identifier |
| `role` | e.g. `watch` (cron-triggered), `interactive` |
| `kind` | e.g. `scheduled` — distinguishes executable kinds |
| `schedule` | Cron expression (5-field, local timezone) |
| `inputs[]` | CLI flags; each has `name`, `flag`, `type`, `required` |
| `claudeCode.*` | model, permissionMode, maxTurns, tools, hooks, skills, etc. |
| `cliTools[]` | External tool requirements (`gh`, `npx`, etc.) with `allowedUses` constraints |
| `scripts.preflight` | Steps run before the main agent prompt (e.g. `composePrompt`) |

## cases.json — smoke + live tiers

Test-style executables (e.g. `nightly-tests`) use `cases.json` with two top-level keys:

```json
{
  "engineSpec": "@kody-ade/kody-engine@latest",
  "smoke": [ /* CLI-only test cases */ ],
  "live": [ /* end-to-end cases with fixture lifecycle */ ]
}
```

### Smoke case fields

| Field | Purpose |
|---|---|
| `name` | Unique case identifier (used by `--filter`) |
| `describe` | Human-readable description |
| `command[]` | CLI invocation (e.g. `["kody", "version"]`) |
| `expectExitCode` | Expected exit code |
| `expectStdoutContains[]` | All strings must appear in stdout |
| `expectStderrContains[]` | All strings must appear in stderr |
| `expectStdoutMatches` | Regex stdout must match |

### Live case fields

| Field | Purpose |
|---|---|
| `fixture` | Issue/PR fixture to create before running |
| `fixture.type` | e.g. `"issue"` |
| `fixture.title` | Issue title; supports `{{ts}}` (Unix timestamp) |
| `fixture.body` | Issue body |
| `fixture.labels[]` | Labels to apply (e.g. `kody:nightly-test`) |
| `command[]` | CLI invocation with `{{issueNumber}}` placeholder |
| `timeoutSec` | Per-case timeout in seconds |
| `pollFor` | Polling config for async completion |
| `pollFor.issueLabelOneOf[]` | Poll until issue has one of these labels |
| `pollFor.intervalSec` | Seconds between polls |
| `pollFor.maxAttempts` | Max poll attempts before timeout |
| `expect` | Outcome assertions (exitCode, prOpened, etc.) |
| `teardown` | Cleanup: close PR + delete branch, close issue |

`{{issueNumber}}` is substituted at runtime after the fixture is created. `{{ts}}` is substituted with the current Unix timestamp.

## Invoking an executable

- **In-repo:** `kody run --executable <name> [--arg value ...]`
- **Published engine:** `npx -y -p @kody-ade/kody-engine@latest kody <name> [args]`

The `nightly-tests` executable uses the latter pattern to exercise the published package.

## See also

- [./nightly-tests](./nightly-tests.md) — the nightly smoke suite executable
- [./ci-workflow](./ci-workflow.md) — how the fan-out workflow triggers scheduled executables
