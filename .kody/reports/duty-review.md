# Kody Duty Review

_Rolling 6h cycle — one duty deep-reviewed per tick._

Cycle 5 — 3 healthy, 5 broken, 30 pending of 38 duties.

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
| coverage-floor | | | pending | |
| dead-code-sweep | | | pending | |
| dependency-bump | | | pending | |
| design-review | | | pending | |
| dev-ci-health | | | pending | |
| docs-code | | | pending | |
| docs-readme | | | pending | |
| duty-review | | | healthy | passes every check |
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
| ui-review | | | pending |