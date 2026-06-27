---
title: Executables
type: architecture
updated: 2026-04-27
sources:
  - https://github.com/aharonyaircohen/Kody-Engine-Tester/pull/3063
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

## Invoking an executable

- **In-repo:** `kody run --executable <name> [--arg value ...]`
- **Published engine:** `npx -y -p @kody-ade/kody-engine@latest kody <name> [args]`

The `nightly-tests` executable uses the latter pattern to exercise the published package.
