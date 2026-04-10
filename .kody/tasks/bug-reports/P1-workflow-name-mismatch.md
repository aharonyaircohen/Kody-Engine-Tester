# [P1] Workflow name mismatch for fix-ci trigger

## Severity
P1 - High

## Summary
The `fix-ci` workflow trigger references a workflow name that doesn't match the actual workflow file, causing automated fix workflows to fail to trigger.

## Impact
- Fix workflows don't trigger automatically
- Manual intervention required for CI fixes
- Delays issue resolution

## Evidence
From Memory Benchmark Report (mem-20260410-1027):
- Workflow runs cancelled before completion
- Only 1 of 5 PRs merged successfully

## Root Cause
Workflow dispatch event references incorrect workflow name in the trigger configuration.

## Suggested Fix
Verify all workflow trigger names match their respective workflow files in `.github/workflows/`.

## Labels
- bug
- p1
- ci
- workflow