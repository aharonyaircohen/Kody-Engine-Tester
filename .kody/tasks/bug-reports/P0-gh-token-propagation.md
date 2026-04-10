# [P0] GH_TOKEN propagation bug - gh CLI operations fail in kody-engine

## Severity
P0 - Critical

## Summary
The GH_TOKEN environment variable is not properly propagated to child processes in kody-engine, causing all `gh` CLI operations to fail when executed from within the engine.

## Impact
- All GitHub CLI operations (gh) fail when run from kody-engine
- Blocks: creating PRs, filing issues, checking repo status
- Affects any workflow that requires gh authentication

## Evidence
From Memory Benchmark Report (mem-20260410-1027):
- 5 issues run (M01, M02, M03, MF1, MF2)
- Only 1 of 5 PRs merged successfully
- MF1 (broken import) did not produce source file - likely due to gh auth failure
- Multiple workflow runs cancelled before completion

## Reproduction
Run any kody-engine task that requires gh CLI:
```
gh auth status  # Fails with authentication error
gh pr create    # Fails - cannot authenticate
```

## Root Cause
The GH_TOKEN is set in the parent environment but not passed through to child process execution context in the orchestrator.

## Suggested Fix
Ensure GH_TOKEN is explicitly passed to all child process environments:
```javascript
child_process.spawn(cmd, args, {
  env: { ...process.env, GH_TOKEN: process.env.GH_TOKEN }
})
```

## Labels
- bug
- p0
- gh-cli
- environment