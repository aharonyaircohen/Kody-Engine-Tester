---
title: Nightly Tests
type: architecture
updated: 2026-04-27
sources:
  - https://github.com/aharonyaircohen/Kody-Engine-Tester/pull/3063
---

The `nightly-tests` executable smoke-tests the published `@kody-ade/kody-engine@latest` package every night. It is not a unit-test suite for this repo — it validates that the engine itself works correctly across all top-level executables and the consumer config.

## Structure

```
.kody/executables/nightly-tests/
  cases.json   — 25 test cases (read-only input)
  profile.json — executable profile definition
  prompt.md   — agent prompt consumed by the engine
  last-run.json — runtime artifact (gitignored)
```

## Cases

Cases are grouped into three categories:

- **CLI behavior** (5 cases): `help`, `--help`, `version`, `--version`, and unknown-command error.
- **Profile-load validation** (18 cases): each top-level executable (`run`, `fix`, `fix-ci`, `resolve`, `review`, `plan`, `classify`, `spec`, `research`, `sync`, `init`, `watch-stale-prs`, `mission-scheduler`, `mission-tick`, `bug`, `feature`, `chore`, `ui-review`, `release`) is invoked and must either accept valid input or fail with a clear missing-flag error. A profile-load crash (e.g. `Cannot find module`) always fails.
- **Config validation** (1 case): running `kody version` must not surface any `kody.config.json` schema errors.

## Assertion types

| Field | Meaning |
|---|---|
| `expectExitCode: N` | exit must equal N |
| `expectExitCodeIn: [N, M]` | exit must be one of the listed values |
| `expectStdoutContains: ["s"]` | all strings must appear in stdout |
| `expectStderrContains: ["s"]` | all strings must appear in stderr |
| `expectStderrLacks: ["s"]` | none of these strings may appear in stderr |
| `expectStdoutMatches: "regex"` | stdout must match the regex |

## Filtering

Pass `--filter "<regex>"` to run only cases whose `name` matches. Used by `workflow_dispatch` for re-running a single failing case.

## Tracking issue

After each run, the agent searches for an open issue titled "Nightly Kody engine tests", posts the results as a comment, and creates the issue + `kody:nightly-tests` label if none exists. See [../conventions/tracking-issues](../conventions/tracking-issues.md).

## See also

- [../architecture/ci-workflow](./ci-workflow.md) — GitHub Actions workflow that runs this executable
