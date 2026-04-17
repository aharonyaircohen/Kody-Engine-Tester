# Plan: P3T23 — Issue attachments and metadata enrichment

## Context

**Task ID:** 2320-260417-185327
**Pipeline run:** run-20260417-1832 (issue #2320)
**Test:** P3T23 — verifies the Kody Engine pipeline correctly:
1. Downloads image attachments from GitHub issues to `attachments/` directory
2. Replaces remote image URLs with local paths in `task.md`
3. Adds `Labels:` section to `task.md` with issue labels
4. Adds `Discussion:` section to `task.md` with issue comments
5. Gracefully handles 404s (preserves original URL, logs warning, continues)

**Classification:** `chore` — pipeline verification task; no source code changes in `src/`

## What P3T23 Is

This is a **Kody Engine test suite** task (P3 = Phase 3 test). The test verifies that when the Kody pipeline processes a GitHub issue containing:
- An image attachment URL (`https://github.com/user-attachments/assets/test-uuid/footer-design.png`)
- At least one label
- At least one comment

...the pipeline produces:
- An `attachments/` directory with downloaded images
- A `task.md` with local paths (not remote URLs), `Labels:` and `Discussion:` sections

The test creates a GitHub issue with the image, labels, and comment via the `test-suite/agent.md` (fire_test function). Verification checks workflow run logs for `'Downloaded attachment:'` and inspects `task.md` for required sections.

## Build Stage Execution

The build stage (currently `running`) executes the `Superpowers Executing Plans` methodology from `.kody/steps/build.md`. Since this is a chore (no code changes needed), the build agent:
1. Reads `task.json` (already created by taskify agent)
2. Reads `task.md` (the GitHub issue content)
3. Verifies that the task is already classified as a chore requiring no source changes
4. Writes the build stage output (context update, review notes)

## Verification

The P3T23 verification requires checking two things **in the pipeline's logs and task directory**:

1. **Pipeline logs** contain `'Downloaded attachment:'` string
2. **`task.md`** contains:
   - Local paths to `attachments/` directory
   - A `Labels:` section (e.g., `Labels: bug, priority:high`)
   - A `Discussion:` section with comment content

If the image URL is unreachable (404), the graceful fallback verification checks:
- Original URL is preserved in `task.md`
- A warning is logged
- Pipeline continues without error

## Key Files

- `.kody/steps/build.md` — build agent instructions (Superpowers methodology)
- `.kody/tasks/2320-260417-185327/task.json` — taskify output (already created)
- `.kody/tasks/2320-260417-185327/task.md` — GitHub issue content (source for enrichment)
- `.kody/tasks/2320-260417-185327/status.json` — pipeline stage state (build=running)
- `.kody/watch/agents/test-suite/agent.md` — P3T23 test definition (lines 541–557)
- `.kody/watch/agents/test-suite/agent.md.archive` — P3T23 detailed spec with mockup image URL
- `.github/workflows/kody.yml` — GitHub Actions workflow that runs the pipeline

## No Source Code Changes Required

This is a **verification** task — it tests whether the Kody pipeline's attachment downloading and metadata enrichment features work correctly. No files in `src/` are affected. The build stage simply validates the task is correctly classified and updates status.
