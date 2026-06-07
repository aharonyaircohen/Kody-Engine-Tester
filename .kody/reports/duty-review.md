# Kody Duty Review

_Rolling 6h cycle — one duty deep-reviewed per tick._

Cycle 6 — 3 healthy, 0 warn, 7 broken of 39 duties.

| Duty | Staff | Cadence | Verdict | Note |
|------|-------|---------|---------|------|
| approval-gate | | | broken | step 5 fans out to two comment writes; no internal cadence guard; state never persisted |
| architecture-audit | | | broken | script missing (.kody/scripts/architecture-audit-tick.py does not exist); state lives at .kody/jobs/ not .kody/duties/ |
| bug | | | healthy | passes every check; event-driven issue-triggered duty, design is sound |
| ceo-performance-review | | | broken | duty.md missing; directory only contains profile.json and prompt.md — cannot execute |
| chore | | | healthy | passes every check; event-driven primitive, design is sound |
| classify | | | healthy | passes every check; event-driven primitive, design is sound |
| cleanup-branches | | | broken | one-action-max violated: procedure fans out to N branch deletions per tick; no per-branch gating |
| clear-empty-goals | | | broken | no procedure; no state; never ticked; jargon goal |
| coverage-floor | | | broken | scripted procedure references .kody/scripts/coverage-floor-tick.py which does not exist; no state file ever created; state contract points to .kody/jobs/ not .kody/duties/ |
| dead-code-sweep | kody | 30d (disabled) | broken | procedure calls .kody/scripts/dead-code-sweep-tick.py which does not exist; state file never created |
| dependency-bump | | | pending | |
| design-review | | | pending | |
| dev-ci-health | | | pending | |
| docs-code | | | pending | |
| docs-readme | | | pending | |
| feature | | | pending | |
| fix | | | pending | |
| fix-ci | | | pending | |
| flaky-test-quarantine | | | pending | |
| health-check | | | pending | |
| job-gap-scan | | | pending | |
| nightly-tests | | | pending | |
| plan | | | pending | |
| pr-health-triage | | | pending | |
| publish-release | | | pending | |
| qa | | | pending | |
| qa-engineer | | | pending | |
| qa-sweep | | | pending | |
| qa-verify | | | pending | |
| redispatch | | | pending | |
| reproduce | | | pending | |
| research | | | pending | |
| review | | | pending | |
| security-audit | | | pending | |
| spec | | | pending | |
| system-audit | | | pending | |
| task-memory-extractor | | | pending | |
| type-debt | | | pending | |
| ui-review | | | pending | |