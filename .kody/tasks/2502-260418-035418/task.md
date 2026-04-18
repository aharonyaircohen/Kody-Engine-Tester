# [run-20260418-0344] P3T12: --from stage flag

Verify --from <stage> re-runs pipeline from the specified stage.

This is a two-step test: first trigger @kody (pipeline starts), then after it completes fire @kody --from build (pipeline resumes from build stage).

Command (step 1): @kody

## Verification
Step 1: Pipeline completes normally.
Step 2: Logs show 'Resuming from: build' — taskify and plan stages are skipped, build stage runs.

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-18):
@kody

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `2502-260418-035418`

