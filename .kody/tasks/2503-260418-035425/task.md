# [run-20260418-0344] P3T13: State bypass on rerun

Verify @kody rerun bypasses the 'already completed' state lock.

This is a two-step test: first trigger @kody (pipeline completes), then after it finishes fire @kody rerun (pipeline re-executes despite kody:done label).

Command (step 1): @kody

## Verification
Step 1: Pipeline completes with kody:done label.
Step 2: Pipeline re-executes (not blocked by 'already completed' message).

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-18):
@kody

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `2503-260418-035425`

