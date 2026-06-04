# Kody Duty Review
_Rolling 6h cycle — one duty deep-reviewed per tick._

Cycle 1 — 2 healthy, 1 warn, 1 broken of 38 duties.

| Duty | Staff | Cadence | Verdict | Note |
|------|-------|---------|---------|------|
| approval-gate | coo | 30m | broken | no cadence guard in procedure; never persisted state |
| architecture-audit | coo | 30m | broken | script missing; state path nonexistent; allowed-commands contradicts procedure |
| bug | cto | event | healthy | passes every check; event-driven issue-triggered duty, design is sound |
| ceo-performance-review | ceo | 7d | broken | state file never written; 404 on both .kody/duties and .kody/jobs paths despite procedure defining state contract |
| chore | coo | 15m | pending | — |
| classify | coo | 15m | pending | — |
| cleanup-branches | coo | 30m | pending | — |
| clear-empty-goals | coo | 1h | pending | — |
| coverage-floor | cto | 1h | broken | disabled; script path .kody/scripts/coverage-floor-tick.py does not exist |
| dead-code-sweep | cto | 7d | pending | — |
| dependency-bump | cto | 30m | pending | — |
| design-review | ux-designer | 7d | pending | — |
| dev-ci-health | cto | 30m | pending | — |
| docs-code | tech-writer | 1d | pending | — |
| docs-readme | tech-writer | 1d | pending | — |
| duty-review | coo | 6h | healthy | healthy — passes every check |
| feature | cto | 1h | pending | — |
| fix | cto | 30m | pending | — |
| fix-ci | cto | 30m | pending | — |
| flaky-test-quarantine | qa | 1h | pending | — |
| health-check | kody | 1d | pending | — |
| job-gap-scan | coo | 1h | pending | — |
| nightly-tests | qa | 1w | pending | — |
| plan | cto | 30m | pending | — |
| pr-health-triage | cto | 1h | pending | — |
| publish-release | cto | 1d | pending | — |
| qa | qa | 1h | pending | — |
| qa-engineer | qa | 1h | pending | — |
| qa-sweep | qa | 7d | pending | — |
| qa-verify | qa | 30m | pending | — |
| redispatch | coo | 15m | pending | — |
| reproduce | cto | 30m | pending | — |
| research | cto | 30m | pending | — |
| review | cto | 30m | pending | — |
| security-audit | cto | 1h | pending | — |
| spec | cto | 1h | pending | — |
| system-audit | coo | 30m | pending | — |
| task-memory-extractor | coo | 30m | pending | — |
| type-debt | cto | 7d | pending | — |
| ui-review | ux-designer | 1d | pending | — |
