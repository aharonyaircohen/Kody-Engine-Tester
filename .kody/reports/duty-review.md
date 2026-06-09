# Kody Duty Review

_Rolling 6h cycle — one duty deep-reviewed per tick._

**Cycle 7** — 5 healthy, 9 broken, 26 pending of 40 duties.

| Duty | Staff | Cadence | Verdict | Note |
|------|-------|---------|---------|------|
| approval-gate | ceo | 1h | broken | step 5 fans out to two comment writes; no internal cadence guard; state never persisted |
| architecture-audit | cto | 7d (disabled) | broken | script missing (.kody/scripts/architecture-audit-tick.py does not exist); state lives at .kody/jobs/ not .kody/duties/ |
| bug | ceo | 1h | healthy | passes every check; event-driven primitive, design is sound |
| ceo-performance-review | ceo | 7d | broken | no state file ever created; procedure says engine writes .kody/duties/ceo-performance-review.state.json but it does not exist; no commit history for any state file |
| chore | kody | event-driven | healthy | passes every check; event-driven primitive, design is sound |
| classify | coo | event-driven | healthy | passes every check; event-driven primitive, design is sound |
| cleanup-branches | coo | manual | broken | one-action-max violated: procedure fans out to N branch deletions per tick; no per-branch gating |
| clear-empty-goals | ceo | — | broken | no procedure; no state; never ticked; jargon goal |
| coverage-floor | cto | 1d | broken | scripted procedure references .kody/scripts/coverage-floor-tick.py which does not exist; no state file ever created; state contract points to .kody/jobs/ not .kody/duties/ |
| dead-code-sweep | cto | 7d | broken | procedure calls .kody/scripts/dead-code-sweep-tick.py which does not exist; state file never created |
| dependency-bump | cto | 30d | broken | script .kody/scripts/dependency-bump-tick.py does not exist; state never created; procedure cannot execute |
| design-review | ceo | — | pending | not yet reviewed |
| dev-ci-health | ceo | — | pending | not yet reviewed |
| docs-code | ceo | — | pending | not yet reviewed |
| docs-readme | ceo | — | pending | not yet reviewed |
| duty-review | coo | 6h | — | self-exempt (reviews itself) |
| feature | ceo | — | pending | not yet reviewed |
| fix | ceo | — | healthy | passes every check; event-driven primitive, design is sound |
| fix-ci | ceo | — | healthy | passes every check; event-driven primitive, design is sound |
| flaky-test-quarantine | qa | 7d | pending | not yet reviewed |
| health-check | ceo | 1h | pending | not yet reviewed |
| job-gap-scan | cto | 7d | pending | not yet reviewed |
| nightly-tests | ceo | — | pending | not yet reviewed |
| plan | ceo | — | pending | not yet reviewed |
| pr-health-triage | ceo | — | pending | not yet reviewed |
| publish-release | ceo | — | pending | not yet reviewed |
| qa | ceo | — | pending | not yet reviewed |
| qa-engineer | ceo | — | pending | not yet reviewed |
| qa-sweep | qa | 7d | broken | state frozen 9 days; no sweep ran |
| qa-verify | ceo | — | pending | not yet reviewed |
| redispatch | ceo | — | pending | not yet reviewed |
| reproduce | ceo | — | pending | not yet reviewed |
| research | ceo | — | pending | not yet reviewed |
| review | ceo | — | pending | not yet reviewed |
| security-audit | cto | 30d | pending | not yet reviewed |
| spec | ceo | — | pending | not yet reviewed |
| system-audit | coo | 6h | pending | not yet reviewed |
| task-memory-extractor | cto | 7d | pending | not yet reviewed |
| type-debt | cto | 14d | pending | not yet reviewed |
| ui-review | ceo | — | pending | not yet reviewed |