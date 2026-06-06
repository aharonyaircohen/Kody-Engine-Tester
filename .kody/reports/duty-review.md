# Kody Duty Review

_Rolling 6h cycle — one duty deep-reviewed per tick._

Cycle 4 — 5 healthy, 0 warn, 4 broken of 40 duties.

| Duty | Staff | Cadence | Verdict | Note |
|------|-------|---------|---------|------|
| approval-gate | cto | 15m | broken | step 5 fans out to two comment writes; no internal cadence guard; state never persisted |
| architecture-audit.md | cto | 7d (disabled) | broken | script missing (.kody/scripts/architecture-audit-tick.py does not exist); state lives at .kody/jobs/ not .kody/duties/ |
| bug | kody | event-driven | healthy | passes every check; event-driven issue-triggered duty, design is sound |
| ceo-performance-review | ceo | 7d | broken | duty.md missing; directory only contains profile.json and prompt.md — cannot execute |
| chore | kody | event-driven | healthy | passes every check; event-driven primitive, design is sound |
| classify | coo | event-driven | healthy | passes every check; event-driven primitive, design is sound |
| cleanup-branches | coo | manual | broken | one-action-max violated: procedure fans out to N branch deletions per tick; no per-branch gating |
| clear-empty-goals.md | kody | 1d (disabled) | pending | |
| coverage-floor.md | kody | 1d (disabled) | broken | disabled; script path .kody/scripts/coverage-floor-tick.py does not exist |
| dead-code-sweep.md | kody | 30d (disabled) | pending | |
| dependency-bump.md | kody | 7d (disabled) | pending | |
| design-review | ux-designer | 7d | pending | |
| dev-ci-health | cto | 15m | pending | |
| docs-code | tech-writer | 1d | pending | |
| docs-readme | tech-writer | 1d | pending | |
| duty-review | coo | 6h | healthy | passes every check |
| feature | kody | event-driven | pending | |
| fix-ci | kody | event-driven | pending | |
| fix | kody | event-driven | pending | |
| flaky-test-quarantine.md | kody | 1d (disabled) | pending | |
| health-check | kody | 1d | pending | |
| job-gap-scan | ceo | event-driven | pending | |
| nightly-tests | qa | event-driven | pending | |
| plan | cto | event-driven | pending | |
| pr-health-triage | cto | 15m | pending | |
| publish-release | cto | manual | pending | |
| qa-engineer | qa | event-driven | pending | |
| qa-sweep | qa | 1d | pending | |
| qa-verify | qa | 30m | pending | |
| qa | qa | 30m | pending | |
| redispatch | kody | 30m | pending | |
| reproduce | qa | event-driven | pending | |
| research | cto | event-driven | pending | |
| review | cto | event-driven | pending | |
| security-audit | cto | 1d | pending | |
| spec | cto | event-driven | pending | |
| system-audit | coo | 30m | pending | |
| task-memory-extractor | coo | 30m | pending | |
| type-debt.md | kody | 7d (disabled) | pending | |
| ui-review | ux-designer | event-driven | pending | |
