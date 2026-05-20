---
name: use-vitest-not-jest
title: Stick with Vitest; do not migrate to Jest
type: decision
source: executor:spec
recorded_at: 2026-05-20T14:58:00Z
---

Considered swapping to Jest for ecosystem parity with the Payload defaults. Rejected because (1) the existing `vitest.config.mts` is already wired for the project's TS path aliases and ESM-first source layout, (2) Jest's ESM support still requires a Babel layer that we'd own forever, and (3) all current tests use `vi.*` mocks that would need rewriting.

Future sessions: when test-runner choice comes up, treat this as settled. The reason is portability cost vs. zero new capability, not a value judgement about Jest.
