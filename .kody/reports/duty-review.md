# Kody Duty Review

_Rolling 6h cycle — one duty deep-reviewed per tick._

Cycle 7 — 7 healthy, 1 warn, 15 broken of 40 duties.

| Duty | Staff | Cadence | Verdict | Note |
|------|-------|---------|---------|------|
| approval-gate | coo | 6h | broken | step 5 fans out to two comment writes; no internal cadence guard; state never persisted |
| architecture-audit | coo | 1h | broken | script missing (.kody/scripts/architecture-audit-tick.py does not exist); state lives at .kody/jobs/ not .kody/duties/ |
| bug | ceo | 1h | healthy | passes every check; event-driven primitive, design is sound |
| ceo-performance-review | ceo | 7d | broken | no state file ever created; procedure says engine writes .kody/duties/ceo-performance-review.state.json but it does not exist; no commit history for any state file |
| chore | ceo | 1h | healthy | passes every check; event-driven primitive, design is sound |
| classify | ceo | 1h | healthy | passes every check; event-driven primitive, design is sound |
| cleanup-branches | ceo | 1d | broken | one-action-max violated: procedure fans out to N branch deletions per tick; no per-branch gating; state file never created; never run |
| clear-empty-goals | — | 1d | broken | no procedure; no state; never ticked; jargon goal ("gods") |
| coverage-floor | — | 1d | broken | scripted procedure references .kody/scripts/coverage-floor-tick.py which does not exist; no state file ever created; state contract points to .kody/jobs/ not .kody/duties/ |
| dead-code-sweep | — | 1d | broken | procedure calls .kody/scripts/dead-code-sweep-tick.py which does not exist; state file never created |
| dependency-bump | — | 1d | broken | script .kody/scripts/dependency-bump-tick.py does not exist; state never created; procedure cannot execute |
| design-review | — | 3d | pending | not yet reviewed |
| dev-ci-health | — | 2h | pending | not yet reviewed |
| docs-code | — | 1d | pending | not yet reviewed |
| docs-readme | — | 1d | pending | not yet reviewed |
| duty-review | coo | 6h | — | self-exempt |
| feature | — | 1h | pending | not yet reviewed |
| fix-ci | ceo | 1h | healthy | passes every check; event-driven primitive, design is sound |
| fix | ceo | 1h | healthy | passes every check; event-driven primitive, design is sound |
| flaky-test-quarantine | — | 1d | broken | procedure calls .kody/scripts/flaky-test-quarantine-tick.py which does not exist; state file never created |
| health-check | — | 30m | pending | not yet reviewed |
| job-gap-scan | — | 1h | pending | not yet reviewed |
| nightly-tests | — | 1d | pending | not yet reviewed |
| plan | ceo | 1h | pending | not yet reviewed |
| pr-health-triage | — | 1h | pending | not yet reviewed |
| publish-release | — | — | pending | not yet reviewed |
| qa-engineer | qa | 1h | pending | not yet reviewed |
| qa-sweep | qa | 7d | broken | state frozen 9 days; no sweep ran |
| qa-verify | qa | 1h | pending | not yet reviewed |
| qa | qa | 1h | pending | not yet reviewed |
| redispatch | ceo | 6h | pending | not yet reviewed |
| reproduce | ceo | 1h | pending | not yet reviewed |
| research | — | 1h | pending | not yet reviewed |
| review | ceo | 1h | pending | not yet reviewed |
| security-audit | — | 1d | pending | not yet reviewed |
| spec | ceo | 1h | pending | not yet reviewed |
| system-audit | coo | 1h | pending | not yet reviewed |
| task-memory-extractor | — | 1h | pending | not yet reviewed |
| type-debt | — | 1d | broken | procedure calls .kody/scripts/type-debt-tick.py which does not exist; state file never created |
| ui-review | — | 1d | pending | not yet reviewed |