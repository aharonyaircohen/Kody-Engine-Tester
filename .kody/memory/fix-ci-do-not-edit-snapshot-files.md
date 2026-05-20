---
name: fix-ci-do-not-edit-snapshot-files
title: fix-ci must not edit __snapshots__ files
type: lesson
source: executor:fix-ci
recorded_at: 2026-05-20T14:50:00Z
---

During a synthetic fix-ci run, the executor noticed a failing test and 'fixed' it by editing the snapshot under `__snapshots__/`. Tests then passed but the real assertion was masked — the regression shipped.

Rule: never modify files under `__snapshots__/` from within the fix-ci executable. If the snapshot is genuinely stale, the right path is `vitest --update` invoked deliberately as part of the task, not as a side effect of fix-ci's normal edit loop. If the snapshot is wrong because the assertion is wrong, fix the assertion; the snapshot regenerates on next pass.
