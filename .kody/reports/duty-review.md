## Kody Duty Review

_Rolling 6h cycle — one duty deep-reviewed per tick._

Cycle 7 — 3 healthy, 0 warn, 8 broken of 11 duties.

| Duty | Staff | Cadence | Verdict | Note |
|------|-------|---------|---------|------|
| approval-gate | | | broken | step 5 fans out to two comment writes; no internal cadence guard; state never persisted |
| architecture-audit | | | broken | script missing (.kody/scripts/architecture-audit-tick.py does not exist); state lives at .kody/jobs/ not .kody/duties/ |
| bug | kody | event-driven | healthy | passes every check; event-driven primitive, design is sound |
| ceo-performance-review | | | broken | duty.md missing; directory only contains profile.json and prompt.md — cannot execute |
| chore | | | healthy | passes every check; event-driven primitive, design is sound |
| classify | | | healthy | passes every check; event-driven primitive, design is sound |
| cleanup-branches | | | broken | one-action-max violated: procedure fans out to N branch deletions per tick; no per-branch gating |
| clear-empty-goals | | | broken | no procedure; no state; never ticked; jargon goal |
| coverage-floor | | | broken | scripted procedure references .kody/scripts/coverage-floor-tick.py which does not exist; no state file ever created; state contract points to .kody/jobs/ not .kody/duties/ |
| dead-code-sweep | | | broken | procedure calls .kody/scripts/dead-code-sweep-tick.py which does not exist; state file never created |
| dependency-bump | | | broken | script .kody/scripts/dependency-bump-tick.py does not exist; state never created; procedure cannot execute |
