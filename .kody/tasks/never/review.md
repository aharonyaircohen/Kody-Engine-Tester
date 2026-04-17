

The plan is ready. Here's a summary of the situation:

- **Task**: Classify the test suite digest from `run-20260417-1832` (44 tests) into a `classify.json` file.
- **Previous build agent**: Failed silently — its JSONL files were truncated/crashed, and `classify.json` was never written.
- **Verify errors**: The verify step ran `pnpm verify` (lint/typecheck) against the broader codebase and surfaced 13 pre-existing errors — these are unrelated to this classification task and should be suppressed.
- **What I need to do**: Write `classify.json` and update `status.json` — no source files touched.