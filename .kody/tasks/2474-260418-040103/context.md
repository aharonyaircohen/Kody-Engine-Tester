
### taskify (2026-04-18T04:08:02)

The plan is ready for your review. To summarize:

- **Bug:** `.github/workflows/kody.yml` line 56 has `workflows: ["CI"]` which prevents `fix-ci-trigger` from firing for workflows not named exactly "CI" (like the T19 test's "Test CI")
- **Fix:** Remove `workflows: ["CI"]` from the `workflow_run` trigger — the existing `if:` condition on the job already gates on `conclusion == 'failure' && event == 'pull_request'`
- **Then:** Execute the full T19 verification steps (create breakable workflow, br
...(truncated)

### build (2026-04-18T04:08:54)
The plan is ready for your review. It calls for a single-line YAML edit in `.github/workflows/kody.yml` — removing `workflows: ["CI"]` from the `workflow_run` trigger so the `fix-ci-trigger` job fires for **all** workflow completions (not just those named exactly "CI"). The job's existing `if:` condition already gates on `conclusion == 'failure' && event == 'pull_request'`, so no other changes are needed.
