---
generatedAt: "2026-06-08T14:31:09Z"
dutySlug: health-check
findings:
  - id: stale-running-issues
    severity: high
    title: Three running issues are stale beyond the six-hour threshold
    data:
      thresholdHours: 6
      count: 3
      issues: [3029, 3153, 3175]
  - id: stale-failed-issues
    severity: high
    title: Thirteen failed issues are stale beyond the six-hour threshold
    data:
      thresholdHours: 6
      count: 13
      newestIssue: 3646
---

# Kody Health Check

_Threshold: 6h_

## Running
- [#3029](https://github.com/aharonyaircohen/Kody-Engine-Tester/issues/3029) — test mission — 1061h since last update
- [#3153](https://github.com/aharonyaircohen/Kody-Engine-Tester/issues/3153) — [live-test v0.3.58] add a one-line greet utility — 849h since last update
- [#3175](https://github.com/aharonyaircohen/Kody-Engine-Tester/issues/3175) — [live-test bug-container] clamp() returns NaN for NaN input — 794h since last update

## Failed
- [#3646](https://github.com/aharonyaircohen/Kody-Engine-Tester/issues/3646) — Smoke test: kody 0.4.209 (audit + TDD coverage) — 52h since last update
- [#3592](https://github.com/aharonyaircohen/Kody-Engine-Tester/issues/3592) — [test:reproduce] Bug: GET /health is supposed to include  — 95h since last update
- [#3273](https://github.com/aharonyaircohen/Kody-Engine-Tester/issues/3273) — Phase 2 typed outcome smoke test (1778482836) — 678h since last update
- [#3270](https://github.com/aharonyaircohen/Kody-Engine-Tester/issues/3270) — Phase 0 instrumentation smoke test (1778481930) — 678h since last update
- [#3193](https://github.com/aharonyaircohen/Kody-Engine-Tester/issues/3193) — Bug: Footer copyright year is hard-coded to 2024 (retest) — 761h since last update
- [#3191](https://github.com/aharonyaircohen/Kody-Engine-Tester/issues/3191) — Chore: Update README badges section to point at the current default branch — 762h since last update
- [#3190](https://github.com/aharonyaircohen/Kody-Engine-Tester/issues/3190) — Bug: Footer copyright year is hard-coded to 2024 — 762h since last update
- [#3180](https://github.com/aharonyaircohen/Kody-Engine-Tester/issues/3180) — [live-test bug-container fix v4] Add JSDoc @example to clamp — 792h since last update
- [#3179](https://github.com/aharonyaircohen/Kody-Engine-Tester/issues/3179) — [live-test bug-container fix v3] Add JSDoc @example to clamp — 793h since last update
- [#3178](https://github.com/aharonyaircohen/Kody-Engine-Tester/issues/3178) — [live-test bug-container fix v2] clamp.test.ts: add edge-case test for min===max===value — 793h since last update
- [#3177](https://github.com/aharonyaircohen/Kody-Engine-Tester/issues/3177) — [live-test bug-container fix] truncate util: handle undefined input gracefully — 793h since last update
- [#3173](https://github.com/aharonyaircohen/Kody-Engine-Tester/issues/3173) — [live test 0.3.70 - feature] Add slugify utility for URL-safe strings — 813h since last update
- [#3171](https://github.com/aharonyaircohen/Kody-Engine-Tester/issues/3171) — [live test 0.3.70 - classify] Greeting endpoint returns wrong language — 813h since last update
