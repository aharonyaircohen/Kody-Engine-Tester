# feat: session FTS search across past pipeline runs

## Description
Verify that the session FTS search works: after any pipeline run, episodes are auto-indexed and searchable.

## Verification steps
1. Run any pipeline (e.g. `@kody run` on this issue)
2. After completion: `kody graph search . "JWT"` or `kody graph search . "middleware"`
3. Check `.kody/graph/sessions-index.json` exists with indexed content
4. Run `kody graph status .` — Episodes count should be > 0

## How to test
Comment `@kody run` on this issue to trigger CI pipeline.

---

## Discussion (4 comments)

**@aguyaharonyair** (2026-04-09):
Testing FTS search — running pipeline to create episodes

**@aguyaharonyair** (2026-04-09):
@kody run

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `run` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24194982568))

To rerun: `@kody rerun run --from <stage>`

**@aharonyaircohen** (2026-04-09):
🤔 **Kody has questions before proceeding:**

1. Should episodes refer to individual pipeline stages (taskify, plan, build, verify, review, review-fix, ship) or individual runs within the .kody/runs/ JSONL files?
2. Should the indexing happen automatically after each pipeline run completes (via a hook in the pipeline), or manually via a CLI command?
3. What content should be indexed for FTS - only the run metadata (runId, issueNumber, outcome, stagesCompleted) or also the full run logs/steps?

Reply with `@kody approve` and your answers in the comment body.

