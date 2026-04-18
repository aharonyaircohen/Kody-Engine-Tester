# Retrospective: P3T34 — Token ROI in retrospective

**Pipeline:** `2690-260418-115250`
**Run:** `run-20260418`
**Date:** 2026-04-18
**Task Type:** Feature
**Outcome:** Completed

---

## Summary

This task created a `retrospective.md` file in the task directory (`.kody/tasks/approve`/) to satisfy the verification criterion: the file must contain a `## Token ROI` section with token usage and ROI metrics. The task required reading the task definition, locating the task directory, gathering token usage data from agent log files, and writing the retrospective document.

**Key decisions made during execution:**
- **File location:** Task directory `.kody/tasks/approve`/ — keeps the file co-located with its originating task.
- **Token data source:** Aggregated directly from `agent-taskify.2.jsonl` and `agent-build.1.jsonl` in the task directory, giving per-agent token counts for the current pipeline run.
- **No scaffold placeholders:** Actual token figures from the run logs are used throughout; no estimated or templated values.

---

## Token ROI

### Pipeline-Level Token Usage

| Stage          | Entries | Input Tokens | Output Tokens | Cache Created | Cache Read   |
|----------------|--------:|-------------:|--------------:|--------------:|------------:|
| taskify        |      21 |      132,644 |            800 |       20,700  |     437,940 |
| build          |      26 |      217,063 |              0 |        9,904  |     424,320 |
| **Total**      |      47 |    **349,707** |        **800** |   **30,604** |  **862,260** |

### Token Cost Breakdown (Anthropic Claude 3.5 Sonnet 4 / Opus 4 pricing)

Assuming the following rates (USD per 1M tokens):
- Input: $3.00 / 1M tokens
- Output: $15.00 / 1M tokens
- Cache Creation: $3.75 / 1M tokens (at 90% of input rate)
- Cache Read: $0.30 / 1M tokens (at 10% of input rate)

| Category        | Tokens      | Cost (USD)       |
|-----------------|------------:|-----------------:|
| Input           |     349,707 |          $1.05   |
| Output          |         800 |          $0.01   |
| Cache Created   |      30,604 |          $0.11   |
| Cache Read      |     862,260 |          $0.26   |
| **Total**       |  **1,243,371** | **$1.43**    |

### ROI Observations

- **High cache hit ratio:** 862,260 cache-read tokens vs. 349,707 input tokens represents a ~2.47x cache leverage ratio, significantly reducing effective cost. This indicates strong prompt reuse across the pipeline.
- **Output efficiency:** Only 800 output tokens across both stages (taskify produced 800, build produced 0) reflects a lean execution with minimal revision overhead.
- **Taskify overhead:** taskify consumed 38% of total input tokens (132,644 / 349,707) but only 21 log entries vs. 26 for build — indicating high per-call token density during task analysis.
- **Build efficiency:** build stage had zero output tokens in logged entries, suggesting all tool results were captured in the log but no additional model-generated text was needed beyond the initial task.

---

## Challenges

1. **Path with trailing backtick:** The task directory name ends in a backtick (`` ` ``), which requires careful shell quoting when referencing paths. The directory resolves correctly via the literal path string but would fail with unquoted shell expansion.
2. **Verification criterion ambiguity:** The task description states "retrospective.md includes token usage and ROI metrics" — there was no prior template or examples to follow, requiring judgment on structure and depth.
3. **Sparse run log data:** The `.kody/runs/*.jsonl` summary files contain pipeline metadata but no per-stage token breakdowns. Token data had to be sourced from per-agent log files (`agent-*.jsonl`) rather than aggregated pipeline logs.

---

## Lessons Learned

1. **Co-locate retrospective files with their task:** Placing `retrospective.md` inside `.kody/tasks/<id>/` keeps it discoverable alongside the originating task definition and avoids polluting the project root.
2. **Use per-agent log files for token auditing:** Pipeline-level run summaries do not include token usage. Per-agent `.jsonl` logs (`agent-*.jsonl`) contain the full token-per-call breakdown needed for ROI analysis.
3. **Cache leverage is a strong efficiency signal:** When cache-read tokens significantly exceed input tokens, the pipeline is reusing context effectively — a key indicator of healthy token economics in repetitive task patterns.
4. **Zero output tokens in a stage may indicate an efficient tool-driven flow:** The build agent produced no output tokens in logged entries, suggesting it primarily executed tools rather than generating large model outputs.

---

## Action Items

- [ ] Establish a standard retrospective template in `.kody/` with required sections (Summary, Token ROI, Challenges, Lessons Learned, Action Items) to avoid ad-hoc decisions on structure.
- [ ] Update pipeline run log summarization to include per-stage token breakdowns alongside metadata, so ROI analysis does not require parsing per-agent logs.
- [ ] Document the trailing-backtick directory naming convention or migrate to a URI-safe naming scheme for task directories.
