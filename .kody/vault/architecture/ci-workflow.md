---
title: CI Workflow
type: architecture
updated: 2026-04-27
sources:
  - https://github.com/aharonyaircohen/Kody-Engine-Tester/pull/3063
---

GitHub Actions workflows live in `.github/workflows/`. PR #3063 added the nightly smoke suite workflow.

## kody-nightly-tests

**File:** `.github/workflows/kody-nightly-tests.yml`

Runs the [`nightly-tests`](../architecture/nightly-tests.md) executable on a cron schedule and via `workflow_dispatch`.

### Schedule

- **Cron:** `0 2 * * *` (02:00 UTC daily)
- **Manual:** `workflow_dispatch` with an optional `filter` input (regex string scoped to case `name`)

### Environment

- `ubuntu-latest`, Node 22, Python 3.12 with pip caching for `litellm[proxy]`
- `issues: write` (needed to post comments on the tracking issue)
- `contents: read`

### Invocation pattern

```
npx -y -p @kody-ade/kody-engine@latest kody nightly-tests [--filter "<regex>"]
```

`npx` is used directly (not `kody run`) because the intent is to exercise the **published** package, not a local copy.
