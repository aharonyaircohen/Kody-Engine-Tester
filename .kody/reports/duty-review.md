# Kody AgentResponsibility Review

_Rolling 6h cycle — one agentResponsibility deep-reviewed per tick._

Cycle 10 — 5 healthy, 11 broken, 22 pending of 38 agentResponsibilities.

| AgentResponsibility | Agent | Cadence | Verdict | Note |
|------|-------|---------|---------|------|
| approval-gate | cto | 15m | broken | step 5 fans out to two comment writes (merge dispatch + silent audit); no internal cadence guard; nextEligibleISO never written to state; state file never created |
| architecture-audit | cto | 7d (disabled) | broken | disabled: true (idle by intent) but procedure broken — script .kody/scripts/architecture-audit-tick.py does not exist; state file never created |
| bug | kody | — | healthy | passes every check; event-driven primitive, design is sound |
| ceo-performance-review | ceo | 7d | broken | no state file ever created; procedure says engine writes .kody/agent-responsibilities/ceo-performance-review.state.json but it does not exist; no commit history for any state file |
| chore | kody | — | healthy | passes every check; event-driven primitive, design is sound |
| classify | coo | — | healthy | passes every check; event-driven primitive, design is sound |
| cleanup-branches | coo | manual | broken | one-action-max violated: procedure fans out to N branch deletions per tick; no per-branch gating; state file never created; never run |
| clear-empty-goals | — | 1d | broken | no procedure; no state; never ticked; jargon goal ("gods") |
| coverage-floor | kody | 1d (disabled) | broken | disabled: true (idle by intent) but procedure calls missing script (.kody/scripts/coverage-floor-tick.py); state never created; cadence inconsistency (every: 1d vs nextEligibleISO: +20h in state contract) |
| dead-code-sweep | kody | 30d (disabled) | broken | disabled: true (idle by intent) but script does not exist (.kody/scripts/dead-code-sweep-tick.py); one-action-max violated: state write + commit + push in one tick; no kody-job-next-state block in procedure body |
| dependency-bump | kody | 7d (disabled) | broken | disabled: true (idle by intent) but script .kody/scripts/dependency-bump-tick.py does not exist; state never created; procedure cannot execute |
| design-review | ux-designer | 7d | pending | — |
| dev-ci-health | cto | 15m | pending | — |
| docs-code | tech-writer | 1d | pending | — |
| docs-readme | tech-writer | 1d | pending | — |
| feature | kody | — | pending | — |
| fix | kody | — | healthy | passes every check; event-driven primitive, design is sound |
| fix-ci | kody | — | healthy | passes every check; event-driven primitive, design is sound |
| flaky-test-quarantine | kody | 1d (disabled) | broken | disabled: true (idle by intent) but procedure calls .kody/scripts/flaky-test-quarantine-tick.py which does not exist; state file never created |
| health-check | kody | 1d | pending | — |
| job-gap-scan | ceo | — | pending | — |
| nightly-tests | qa | — | pending | — |
| plan | cto | — | pending | — |
| pr-health-triage | cto | 15m | pending | — |
| publish-release | cto | manual | pending | — |
| qa | qa | 30m | pending | — |
| qa-engineer | qa | — | pending | — |
| qa-sweep | qa | 1d | broken | state frozen 9 days; no sweep ran |
| qa-verify | qa | 30m | pending | — |
| redispatch | kody | 30m | pending | — |
| reproduce | qa | — | pending | — |
| research | cto | — | pending | — |
| review | cto | — | pending | — |
| security-audit | cto | 1d | pending | — |
| spec | cto | — | pending | — |
| system-audit | coo | 30m | pending | — |
| task-memory-extractor | coo | 30m | pending | — |
| type-debt | kody | 7d (disabled) | broken | disabled: true (idle by intent) but procedure calls .kody/scripts/type-debt-tick.py which does not exist; state file never created |
| ui-review | ux-designer | — | pending | — |
