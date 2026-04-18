
### build (2026-04-18T11:00:14)
## Summary

**Task P2T07: Fix rebuilds from build stage** — ✅ Complete

### Problem
When CI fails on a PR, the `fix-ci-trigger` workflow fires, which posts a `@kody fix-ci` comment. The `kody-engine ci-build-args` command wasn't including `--from build` in the output for `fix-ci` mode, causing the pipeline to start from the beginning (taskify/plan stage) instead of from the build stage where the CI failure occurred.

### Fix Applied
Modified the `buildArgs` function in both the global `kody-engi
...(truncated)
