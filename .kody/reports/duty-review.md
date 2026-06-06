# Kody Duty Review

_Rolling 6h cycle — one duty deep-reviewed per tick._

Cycle 4 — 5 healthy, 1 warn, 3 broken of 40 duties.

| Duty | Staff | Cadence | Verdict | Note |
|------|-------|---------|---------|------|
| approval-gate | kody | event-driven | broken | step 5 fans out to two comment writes; no internal cadence guard; state never persisted |
| architecture-audit.md | cto | 7d (disabled) | broken | script missing (.kody/scripts/architecture-audit-tick.py does not exist); state lives at .kody/jobs/ not .kody/duties/ |
| bug | kody | event-driven | healthy | passes every check; event-driven issue-triggered duty, design is sound |
| ceo-performance-review | kody | event-driven | broken | duty.md missing; directory only contains profile.json and prompt.md — cannot execute |
| chore | kody | event-driven | healthy | passes every check; event-driven primitive, design is sound |
| classify | kody | event-driven | pending | |
| cleanup-branches | kody | event-driven | pending | |
| clear-empty-goals.md | kody | 7d (disabled) | pending | |
| coverage-floor.md | kody | 1d (disabled) | broken | disabled; script path .kody/scripts/coverage-floor-tick.py does not exist |
| dead-code-sweep.md | kody | 30d (disabled) | pending | |
| dependency-bump.md | kody | event-driven | pending | |
| design-review | kody | event-driven | pending | |
| dev-ci-health | kody | 1h | pending | |
| docs-code | kody | event-driven | pending | |
| docs-readme | kody | event-driven | pending | |
| duty-review | coo | 6h | healthy | passes every check |
| feature | kody | event-driven | pending | |
| fix-ci | kody | event-driven | pending | |
| fix | kody | event-driven | pending | |
| flaky-test-quarantine.md | kody | 1d (disabled) | pending | |
| health-check | kody | 5m | pending | |
| job-gap-scan | kody | 20m | pending | |
| nightly-tests | kody | 8h | pending | |
| plan | kody | event-driven | pending | |
| pr-health-triage | kody | 2h | pending | |
| publish-release | kody | event-driven | pending | |
| qa-engineer | kody | event-driven | pending | |
| qa-sweep | kody | 7d | pending | |
| qa-verify | kody | event-driven | pending | |
| qa | kody | event-driven | pending | |
| redispatch | kody | event-driven | pending | |
| reproduce | kody | event-driven | pending | |
| research | kody | event-driven | pending | |
| review | kody | event-driven | pending | |
| security-audit | kody | 30d | pending | |
| spec | kody | event-driven | pending | |
| system-audit | kody | 6h | pending | |
| task-memory-extractor | kody | event-driven | pending | |
| type-debt.md | kody | 30d (disabled) | pending | |
| ui-review | kody | event-driven | pending | |