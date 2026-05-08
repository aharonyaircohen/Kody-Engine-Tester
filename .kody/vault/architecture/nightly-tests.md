---
title: Nightly Tests
type: architecture
updated: 2026-05-08
sources:
  - https://github.com/aharonyaircohen/Kody-Engine-Tester/pull/3174
  - https://github.com/aharonyaircohen/Kody-Engine-Tester/pull/3170
---

The `nightly-tests` executable smoke-tests the published `@kody-ade/kody-engine@latest` package every night. It is not a unit-test suite for this repo — it validates that the engine itself works correctly across all top-level executables and the consumer config.

## Structure

```
.kody/executables/nightly-tests/
  cases.json   — two-tier test cases (smoke + live)
  profile.json — executable profile definition
  prompt.md   — agent prompt consumed by the engine
  last-run.json — runtime artifact (gitignored)
```

## Two-tier case structure

Cases live in `cases.json` under two top-level keys:

| Tier | Purpose | GitHub state | Count |
|---|---|---|---|
| `smoke` | Fast CLI validation; no issue/PR created | None | 25 |
| `live` | End-to-end with fixture lifecycle | Creates real issue + PR, tears down | 2 |

**Execution order:** smoke runs first; live runs regardless of smoke results (full coverage on failures). Filtering via `--filter` applies to both tiers.

### Smoke tier

CLI invocation against published engine, no GitHub mutations:

- **CLI behavior** (5): `help`, `--help`, `version`, `--version`, unknown-command.
- **Profile-load validation** (18): each top-level executable (`run`, `fix`, `fix-ci`, `resolve`, `review`, `plan`, `classify`, `spec`, `research`, `sync`, `init`, `watch-stale-prs`, `mission-scheduler`, `mission-tick`, `bug`, `feature`, `chore`, `ui-review`, `release`) invoked with missing flags; a profile-load crash always fails.
- **Config validation** (1): `kody version` must not surface `kody.config.json` schema errors.

### Live tier

Creates a real GitHub issue (fixture), invokes kody, polls for terminal state, asserts on PR/issue state, then tears down.

**`run.add-utility`**: `kody run --issue {{issueNumber}}` on a pure-utility additive issue. Asserts `prOpened: true`, `prBodyContains: ["greet"]`, and `issueCommentMatches: "RUN_COMPLETED"`. Teardown: close PR + delete branch, close issue.

**`feature.full-flow`**: `kody feature --issue {{issueNumber}}` on a small additive issue labeled `kody:feature`. Exercises the full chain (research → plan → run → review) and polls until the issue reaches `kody:done` (max 60 attempts × 60s intervals). Asserts terminal label `kody:done`, PR opened, and `greet` in PR body. Teardown: close PR + delete branch, close issue.

## Fixture lifecycle

Live cases use the `fixture` block to describe the issue created:

```json
"fixture": {
  "type": "issue",
  "title": "[nightly-test {{ts}}] ...",
  "body": "...",
  "labels": ["kody:nightly-test", "kody:feature"]
}
```

`{{ts}}` is substituted with the Unix timestamp. `{{issueNumber}}` is substituted after the issue is created and before the command is run.

After each run, the agent sweeps dangling fixtures (open issues/PRs labeled `kody:nightly-test` older than 24h) before starting new cases.

## Assertion types

| Field | Meaning |
|---|---|
| `expectExitCode: N` | exit must equal N |
| `expectStdoutContains: ["s"]` | all strings must appear in stdout |
| `expectStderrContains: ["s"]` | all strings must appear in stderr |
| `expectStdoutMatches: "regex"` | stdout must match the regex |
| `prOpened: true` | a PR must be opened by the run |
| `prBodyContains: ["s"]` | PR body must contain all strings |
| `issueCommentMatches: "s"` | engine must comment matching pattern on issue |
| `terminalLabel: "kody:done"` | issue must have this label after polling |
| `pollFor` | poll issue until `issueLabelOneOf` appears (intervalSec, maxAttempts) |

## Filtering

Pass `--filter "<regex>"` to run only cases whose `name` matches. Used by `workflow_dispatch` for re-running a single failing case.

## Timeout wrapper (portability)

Every kody invocation is wrapped with `ptimeout` (perl-based, not `timeout`/`gtimeout`) to ensure the command is bounded even on macOS dev machines. Exit 124 = timeout fired.

## Tracking issue and failure reporting

- After each run, the agent finds (or creates) a persistent issue titled "Nightly Kody engine tests", posts the results as a comment, and reopens it if it was closed.
- If **any** case fails, a **separate failure issue** is opened per failed run: title `nightly-tests failures: <YYYY-MM-DD> (<N> failures)`, body = the same report, label `kody:nightly-tests`. Each failed run gets its own issue so trends are visible over time.

## See also

- [./ci-workflow](./ci-workflow.md) — GitHub Actions workflow that runs this executable
- [../conventions/dot-kody-gitignore](../conventions/dot-kody-gitignore.md) — `.kody/` ignore pattern
