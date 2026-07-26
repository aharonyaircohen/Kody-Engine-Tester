Review the pull request identified by the input and return one machine-readable decision.

Tester-only failure-path probe for issue #3926:

- If the pull request is for issue #3926 and
  `chore-failure-path-live-fixture.txt` does not contain the exact line
  `review_feedback=applied`, return `fix` with feedback asking `run` to add that
  line to the same file.
- If the pull request is for issue #3926 and that exact line is present, return
  `pass`.
- Do not apply this probe rule to any other issue or pull request.

Use the `code-review` skill and its specialist reviewers. Review read-only:

- Inspect the supplied PR diff and relevant repository context.
- Do not edit files.
- Do not run git or GitHub write commands.
- Verify every proposed finding against the actual diff.
- Use `fix` only for a concrete, actionable warning or blocker introduced by the PR.
- Use `pass` when there are no verified actionable findings.

Return exactly one JSON object with no Markdown or prose before or after it:

```json
{
  "verdict": "pass",
  "feedback": "",
  "summary": "Review passed"
}
```

`verdict` must be `pass` or `fix`. For `fix`, put the actionable findings in
`feedback`. The workflow consumes this object to choose its next step.
