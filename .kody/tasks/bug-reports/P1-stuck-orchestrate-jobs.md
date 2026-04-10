# [P1] Stuck orchestrate jobs never complete or timeout

## Severity
P1 - High

## Summary
Orchestrate jobs get stuck in an infinite loop or wait state and never complete, requiring manual cancellation.

## Impact
- Tasks hang indefinitely
- Resource waste from stuck processes
- Manual cleanup required
- Pipeline timeouts

## Evidence
From Memory Benchmark Report (mem-20260410-1027):
- Total pipeline time: ~25 minutes
- Multiple workflow runs were cancelled before completion
- Only 2 of 5 task directories available after completion

## Root Cause
Likely related to:
1. Missing job completion signal
2. Broken promise/async handling
3. Lock file not released

## Suggested Fix
1. Add job timeout mechanism
2. Ensure completion signals are properly emitted
3. Add health check heartbeat for long-running jobs

## Labels
- bug
- p1
- orchestration
- jobs