---
title: CI Workflow
type: architecture
updated: 2026-05-05
sources:
  - https://github.com/aharonyaircohen/Kody-Engine-Tester/pull/3174
---

GitHub Actions workflows live in `.github/workflows/`. The nightly smoke suite runs via the single-file fan-out pattern, not a dedicated workflow.

## kody.yml — fan-out hub

**File:** `.github/workflows/kody.yml`

Single job (`run`) that wakes on multiple event types and invokes `npx kody` with contextual arguments. All orchestration logic lives in the kody npm package — this workflow is intentionally simple and ships via `npm publish`.

### Triggers

| Event | Behavior |
|---|---|
| `workflow_dispatch` | Pass-through of sessionId, issue_number, message, model, dashboardUrl |
| `issue_comment` (created) | Feeds comment body to chat mode |
| `pull_request` closed+merged | Fan-out to relevant executables |
| `schedule: */15 * * * *` | Fan-out to all scheduled executables (every 15 min) |

### Permissions

```yaml
issues: write
pull-requests: write
contents: write
actions: read   # enables fix-ci to fetch failed run logs
```

The `actions: read` permission is required for `kody fix-ci` to fetch failed run log artifacts from the GitHub Actions API.

### Invocation pattern

```
npx -y @kody-ade/kody-engine@latest kody ...
```

No shell branching in YAML. The engine reads the event context and decides what to run.

## nightly-tests execution

The `nightly-tests` executable has its own cron schedule (`0 2 * * *` in its `profile.json`). The fan-out tick at `*/15 * * * *` in `kody.yml` triggers it alongside other scheduled executables (e.g. `memorize`, `watch-stale-prs`).

The standalone `kody-nightly-tests.yml` was dropped — the engine now fans out from `kody.yml`.

### Manual re-run

Use `workflow_dispatch` on `kody.yml` with `--filter "<regex>"` to re-run a single failing case.

## See also

- [./nightly-tests](./nightly-tests.md) — executable structure, two-tier cases, fixture lifecycle
- [../conventions/dot-kody-gitignore](../conventions/dot-kody-gitignore.md) — `.kody/` ignore pattern
