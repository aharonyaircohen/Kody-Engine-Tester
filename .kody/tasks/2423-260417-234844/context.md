
### build (2026-04-17T23:54:29)
I've written the plan to `/home/runner/.claude/plans/binary-enchanting-babbage.md`.

**The Bug:** In `ensureFeatureBranchIfNeeded` (the function called before every pipeline run), when `prNumber` is set (fix-ci on an existing PR), the code only syncs with the base branch but **never checks out the PR's head branch**. The pipeline then runs on the default branch checked out by CI, so `getPRForBranch(currentBranch)` in the ship stage can't find the existing PR — resulting in a **new PR** being cre
...(truncated)
