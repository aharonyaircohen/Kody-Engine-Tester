---
name: test-requirements-sibling-enforcement
title: Test Requirements Sibling Enforcement
type: decision
source: task:A78F408A-364B-4DCB-B005-CD360ABBB8D3
recorded_at: 2026-05-20T21:16:46Z
---

The `testRequirements` array in `kody.config.json` defines a structural rule: every `src/app/api/**/route.ts` file must have a sibling test file named `{name}.test{ext}`. This is not a lint rule — it is enforced by the Kody engine itself. Currently only `src/app/api/health/route.ts` has its sibling test; 14 other API routes are technically in violation.

**Why:** The engine uses this contract to gate quality checks. A missing sibling test is treated as a test coverage gap, not just a style warning.

**How to apply:** When authoring any new `src/app/api/**/route.ts`, immediately create the corresponding `route.test.ts` sibling. The pattern is `${dir}/route.test.ts` sitting next to `${dir}/route.ts`.

**Why:** The engine enforces testRequirements as a hard gate during quality checks, not advisory lint. Missing sibling tests will cause CI failures.

**Source task:** `A78F408A-364B-4DCB-B005-CD360ABBB8D3`
