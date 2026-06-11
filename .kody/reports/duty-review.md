# Kody Duty Review

_Rolling 6h cycle — one duty deep-reviewed per tick._

Cycle 8 — 3 healthy, 0 warn, 13 broken of 38 duties.

| Duty | Staff | Cadence | Verdict | Note |
|------|-------|---------|---------|------|
| approval-gate | ceo | 1h | broken | step 5 fans out to two comment writes; no internal cadence guard; state never persisted |
| architecture-audit | kody | 1d | broken | script missing (.kody/scripts/architecture-audit-tick.py does not exist); state lives at .kody/jobs/ not .kody/duties/ |
| bug | ceo | 1h | healthy | passes every check; event-driven primitive, design is sound |
| ceo-performance-review | ceo | 30d | broken | no state file ever created; procedure says engine writes .kody/duties/ceo-performance-review.state.json but it does not exist; no commit history for any state file |
| chore | ceo | 1h | healthy | passes every check; event-driven primitive, design is sound |
| classify | ceo | 1h | healthy | passes every check; event-driven primitive, design is sound |
| cleanup-branches | kody | 1d | broken | one-action-max violated: procedure fans out to N branch deletions per tick; no per-branch gating; state file never created; never run |
| clear-empty-goals | kody | 1h | broken | no procedure; no state; never ticked; jargon goal ("gods") |
| coverage-floor | kody | 20h (disabled) | broken | procedure calls missing script (.kody/scripts/coverage-floor-tick.py); state never created; cadence inconsistency (every: 1d vs nextEligibleISO: +20h in state contract); disabled: true (idle by intent) |
| dead-code-sweep | kody | 7d | broken | script does not exist (.kody/scripts/dead-code-sweep-tick.py); one-action-max violated: state write + commit + push in one tick; no kody-job-next-state block in procedure body |
| dependency-bump | kody | 7d (disabled) | broken | script .kody/scripts/dependency-bump-tick.py does not exist; state never created; procedure cannot execute |
| design-review | kody | 14d | pending | not yet reviewed |
| dev-ci-health | kody | 2h | pending | not yet reviewed |
| docs-code | kody | 14d | pending | not yet reviewed |
| docs-readme | kody | 14d | pending | not yet reviewed |
| feature | ceo | - | pending | not yet reviewed |
| fix | ceo | 1h | healthy | passes every check; event-driven primitive, design is sound |
| fix-ci | ceo | 1h | healthy | passes every check; event-driven primitive, design is sound |
| flaky-test-quarantine | kody | 1d | broken | procedure calls .kody/scripts/flaky-test-quarantine-tick.py which does not exist; state file never created |
| health-check | kody | 5m | pending | not yet reviewed |
| job-gap-scan | kody | 1d | pending | not yet reviewed |
| nightly-tests | kody | 1d | pending | not yet reviewed |
| plan | ceo | - | pending | not yet reviewed |
| pr-health-triage | qa | 1d | pending | not yet reviewed |
| publish-release | kody | - | pending | not yet reviewed |
| qa | qa | 1h | pending | not yet reviewed |
| qa-engineer | qa | 1h | pending | not yet reviewed |
| qa-sweep | qa | 7d | broken | state frozen 9 days; no sweep ran |
| qa-verify | qa | 1h | pending | not yet reviewed |
| redispatch | kody | 30m | pending | not yet reviewed |
| reproduce | ceo | - | pending | not yet reviewed |
| research | ceo | - | pending | not yet reviewed |
| review | ceo | - | pending | not yet reviewed |
| security-audit | kody | 14d | pending | not yet reviewed |
| spec | ceo | - | pending | not yet reviewed |
| system-audit | kody | 1h | pending | not yet reviewed |
| task-memory-extractor | kody | 1h | pending | not yet reviewed |
| type-debt | kody | 7d | broken | procedure calls .kody/scripts/type-debt-tick.py which does not exist; state file never created |
| ui-review | kody | 14d | pending | not yet reviewed |