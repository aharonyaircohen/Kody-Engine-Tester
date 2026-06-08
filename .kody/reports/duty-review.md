# Kody Duty Review

_Rolling 6h cycle — one duty deep-reviewed per tick._

Cycle 7 — 1 healthy, 0 warn, 10 broken of 11 duties.

| Duty | Staff | Cadence | Verdict | Note |
|------|-------|---------|---------|------|
| approval-gate | cto | 15m | broken | step 5 fans out to two comment writes; no internal cadence guard; state never persisted |
| architecture-audit | infra | — | broken | script missing (.kody/scripts/architecture-audit-tick.py does not exist); state lives at .kody/jobs/ not .kody/duties/ |
| bug | detection | event | healthy | passes every check; event-driven issue-triggered duty, design is sound |
| ceo-performance-review | ceo | — | broken | duty.md missing; directory only contains profile.json and prompt.md — cannot execute |
| chore | detection | event | healthy | passes every check; event-driven primitive, design is sound |
| classify | detection | event | healthy | passes every check; event-driven primitive, design is sound |
| cleanup-branches | infra | — | broken | one-action-max violated: procedure fans out to N branch deletions per tick; no per-branch gating |
| clear-empty-goals | detection | — | broken | no procedure; no state; never ticked; jargon goal |
| coverage-floor | infra | — | broken | scripted procedure references .kody/scripts/coverage-floor-tick.py which does not exist; no state file ever created; state contract points to .kody/jobs/ not .kody/duties/ |
| dead-code-sweep | infra | — | broken | procedure calls .kody/scripts/dead-code-sweep-tick.py which does not exist; state file never created |
| dependency-bump | infra | — | broken | script .kody/scripts/dependency-bump-tick.py does not exist; state never created; procedure cannot execute |

_Last run: 2026-06-08T04:50:49Z | Next eligible: 2026-06-08T10:50:49Z_