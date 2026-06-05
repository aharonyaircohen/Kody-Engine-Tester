# Kody Duty Review

_Rolling 6h cycle — one duty deep-reviewed per tick._

Cycle 3 — healthy 2, warn 1, broken 4 of 41 duties.

| Duty | Staff | Cadence | Verdict | Note |
|------|-------|---------|---------|------|
| approval-gate | kody | event-driven | broken | step 5 fans out to two comment writes; no internal cadence guard; state never persisted |
| architecture-audit | kody | 1h | broken | script missing (.kody/scripts/architecture-audit-tick.py does not exist); state lives at .kody/jobs/ not .kody/duties/ |
| bug | kody | event-driven | healthy | passes every check; event-driven issue-triggered duty, design is sound |
| ceo-performance-review | ceo | 1d | broken | state file never written; 404 on both .kody/duties and .kody/jobs paths despite procedure defining state contract |
| chore | kody | 15m | warn | design is sound; report cadence (15m) and staff (coo) do not match profile.json (pr-branch/event-driven, staff: kody) |
| classify | — | — | pending | not yet reviewed |
| cleanup-branches | — | — | pending | not yet reviewed |
| coverage-floor | kody | 1h (disabled) | broken | disabled; script path .kody/scripts/coverage-floor-tick.py does not exist |
| dead-code-sweep | — | — | pending | not yet reviewed |
| dependency-bump | — | — | pending | not yet reviewed |
| design-review | — | — | pending | not yet reviewed |
| dev-ci-health | — | — | pending | not yet reviewed |
| docs-code | — | — | pending | not yet reviewed |
| docs-readme | — | — | pending | not yet reviewed |
| duty-review | coo | 6h | healthy | passes every check |
| feature | — | — | pending | not yet reviewed |
| fix | — | — | pending | not yet reviewed |
| fix-ci | — | — | pending | not yet reviewed |
| flaky-test-quarantine | — | — | pending | not yet reviewed |
| health-check | — | — | pending | not yet reviewed |
| job-gap-scan | — | — | pending | not yet reviewed |
| nightly-tests | — | — | pending | not yet reviewed |
| plan | — | — | pending | not yet reviewed |
| pr-health-triage | — | — | pending | not yet reviewed |
| publish-release | — | — | pending | not yet reviewed |
| qa | — | — | pending | not yet reviewed |
| qa-engineer | — | — | pending | not yet reviewed |
| qa-sweep | — | — | pending | not yet reviewed |
| qa-verify | — | — | pending | not yet reviewed |
| redispatch | — | — | pending | not yet reviewed |
| reproduce | — | — | pending | not yet reviewed |
| research | — | — | pending | not yet reviewed |
| review | — | — | pending | not yet reviewed |
| security-audit | — | — | pending | not yet reviewed |
| spec | — | — | pending | not yet reviewed |
| system-audit | — | — | pending | not yet reviewed |
| task-memory-extractor | — | — | pending | not yet reviewed |
| type-debt | — | — | pending | not yet reviewed |
| ui-review | — | — | pending | not yet reviewed |