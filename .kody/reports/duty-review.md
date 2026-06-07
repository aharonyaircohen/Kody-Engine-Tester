# Kody Duty Review

_Rolling 6h cycle — one duty deep-reviewed per tick._

Cycle 6 — 1 healthy, 0 warn, 8 broken of 26 duties.

| Duty | Staff | Cadence | Verdict | Note |
|------|-------|---------|---------|------|
| approval-gate | | 1h | broken | step 5 fans out to two comment writes; no internal cadence guard; state never persisted |
| architecture-audit | | 1h | broken | script missing (.kody/scripts/architecture-audit-tick.py does not exist); state lives at .kody/jobs/ not .kody/duties/ |
| bug | | 1h | healthy | passes every check; event-driven issue-triggered duty, design is sound |
| ceo-performance-review | | 1h | broken | duty.md missing; directory only contains profile.json and prompt.md — cannot execute |
| chore | | 1h | healthy | passes every check; event-driven primitive, design is sound |
| classify | | 1h | healthy | passes every check; event-driven primitive, design is sound |
| cleanup-branches | | 1h | broken | one-action-max violated: procedure fans out to N branch deletions per tick; no per-branch gating |
| clear-empty-goals | | 1h | broken | no procedure; no state; never ticked; jargon goal |
| coverage-floor | kody | 1d (disabled) | broken | scripted procedure references .kody/scripts/coverage-floor-tick.py which does not exist; no state file ever created; state contract points to .kody/jobs/ not .kody/duties/ |
| dead-code-sweep | | — | pending | not yet reviewed |
| dependency-bump | | — | pending | not yet reviewed |
| design-review | | — | pending | not yet reviewed |
| dev-ci-health | | — | pending | not yet reviewed |
| docs-code | | — | pending | not yet reviewed |
| docs-readme | | — | pending | not yet reviewed |
| flaky-test-quarantine | | — | pending | not yet reviewed |
| health-check | | — | pending | not yet reviewed |
| job-gap-scan | | — | pending | not yet reviewed |
| pr-health-triage | | — | pending | not yet reviewed |
| publish-release | | — | pending | not yet reviewed |
| qa-sweep | | — | pending | not yet reviewed |
| qa-verify | | — | pending | not yet reviewed |
| qa | | — | pending | not yet reviewed |
| redispatch | | — | pending | not yet reviewed |
| security-audit | | — | pending | not yet reviewed |
| system-audit | | — | pending | not yet reviewed |
| task-memory-extractor | | — | pending | not yet reviewed |
| type-debt | | — | pending | not yet reviewed |