# Kody Duty Review

_Rolling 6h cycle — one duty deep-reviewed per tick._

Cycle 8 — 5 healthy, 9 warn, 26 broken of 40 duties.

| Duty | Staff | Cadence | Verdict | Note |
|------|-------|---------|---------|------|
| approval-gate | | | broken | step 5 fans out to two comment writes; no internal cadence guard; state never persisted |
| architecture-audit | | | broken | script missing (.kody/scripts/architecture-audit-tick.py does not exist); state lives at .kody/jobs/ not .kody/duties/ |
| bug | | | healthy | passes every check; event-driven primitive, design is sound |
| ceo-performance-review | | | broken | no state file ever created; procedure says engine writes .kody/duties/ceo-performance-review.state.json but it does not exist; no commit history for any state file |
| chore | | | healthy | passes every check; event-driven primitive, design is sound |
| classify | | | healthy | passes every check; event-driven primitive, design is sound |
| cleanup-branches | | | broken | one-action-max violated: procedure fans out to N branch deletions per tick; no per-branch gating; state file never created; never run |
| clear-empty-goals | | | broken | no procedure; no state; never ticked; jargon goal ("gods") |
| coverage-floor | kody | 1d (disabled) | broken | procedure calls missing script (.kody/scripts/coverage-floor-tick.py); state never created; cadence inconsistency (every: 1d vs nextEligibleISO: +20h in state contract) |
| dead-code-sweep | | | broken | procedure calls .kody/scripts/dead-code-sweep-tick.py which does not exist; state file never created |
| dependency-bump | | | broken | script .kody/scripts/dependency-bump-tick.py does not exist; state never created; procedure cannot execute |
| design-review | | | — | pending |
| dev-ci-health | | | — | pending |
| docs-code | | | — | pending |
| docs-readme | | | — | pending |
| duty-review | | | — | pending |
| feature | | | — | pending |
| fix | | | healthy | passes every check; event-driven primitive, design is sound |
| fix-ci | | | healthy | passes every check; event-driven primitive, design is sound |
| flaky-test-quarantine | | | broken | procedure calls .kody/scripts/flaky-test-quarantine-tick.py which does not exist; state file never created |
| health-check | | | — | pending |
| job-gap-scan | | | — | pending |
| nightly-tests | | | — | pending |
| plan | | | — | pending |
| pr-health-triage | | | — | pending |
| publish-release | | | — | pending |
| qa | | | — | pending |
| qa-engineer | | | — | pending |
| qa-sweep | | | broken | state frozen 9 days; no sweep ran |
| qa-verify | | | — | pending |
| redispatch | | | — | pending |
| reproduce | | | — | pending |
| research | | | — | pending |
| review | | | — | pending |
| security-audit | | | — | pending |
| spec | | | — | pending |
| system-audit | | | — | pending |
| task-memory-extractor | | | — | pending |
| type-debt | | | broken | procedure calls .kody/scripts/type-debt-tick.py which does not exist; state file never created |
| ui-review | | | — | pending |
