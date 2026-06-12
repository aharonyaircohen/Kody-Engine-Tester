# Kody Duty Review

_Rolling 6h cycle — one duty deep-reviewed per tick._

Cycle 9 — 5 healthy, 0 warn, 11 broken of 39 duties.

| Duty | Staff | Cadence | Verdict | Note |
|------|-------|---------|---------|------|
| approval-gate | cto | 15m | broken | step 5 fans out to two comment writes (merge dispatch + silent audit); no internal cadence guard; nextEligibleISO never written to state; state file never created |
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
| design-review | ux-designer | 7d | pending | not yet reviewed in cycle 9 |
| dev-ci-health | cto | 15m | pending | not yet reviewed in cycle 9 |
| docs-code | tech-writer | 1d | pending | not yet reviewed in cycle 9 |
| docs-readme | tech-writer | 1d | pending | not yet reviewed in cycle 9 |
| feature | kody | - | pending | not yet reviewed in cycle 9 |
| fix | ceo | 1h | healthy | passes every check; event-driven primitive, design is sound |
| fix-ci | ceo | 1h | healthy | passes every check; event-driven primitive, design is sound |
| flaky-test-quarantine | kody | 1d | broken | procedure calls .kody/scripts/flaky-test-quarantine-tick.py which does not exist; state file never created |
| health-check | kody | 1d | pending | not yet reviewed in cycle 9 |
| job-gap-scan | ceo | - | pending | not yet reviewed in cycle 9 |
| nightly-tests | qa | - | pending | not yet reviewed in cycle 9 |
| plan | cto | - | pending | not yet reviewed in cycle 9 |
| pr-health-triage | cto | 15m | pending | not yet reviewed in cycle 9 |
| publish-release | cto | manual | pending | not yet reviewed in cycle 9 |
| qa | qa | 30m | pending | not yet reviewed in cycle 9 |
| qa-engineer | qa | - | pending | not yet reviewed in cycle 9 |
| qa-sweep | qa | 7d | broken | state frozen 9 days; no sweep ran |
| qa-verify | qa | 30m | pending | not yet reviewed in cycle 9 |
| redispatch | kody | 30m | pending | not yet reviewed in cycle 9 |
| reproduce | qa | - | pending | not yet reviewed in cycle 9 |
| research | cto | - | pending | not yet reviewed in cycle 9 |
| review | cto | - | pending | not yet reviewed in cycle 9 |
| security-audit | cto | 1d | pending | not yet reviewed in cycle 9 |
| spec | cto | - | pending | not yet reviewed in cycle 9 |
| system-audit | coo | 30m | pending | not yet reviewed in cycle 9 |
| task-memory-extractor | coo | 30m | pending | not yet reviewed in cycle 9 |
| type-debt | kody | 7d | broken | procedure calls .kody/scripts/type-debt-tick.py which does not exist; state file never created |
| ui-review | ux-designer | - | pending | not yet reviewed in cycle 9 |
