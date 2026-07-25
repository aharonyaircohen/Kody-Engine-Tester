# Instructions

Use the `security-audit` skill.

When `KODY_DRY_RUN` is `true`, do not create or update GitHub issues, comments,
pull requests, branches, or files. Report the would-be action instead.

Run only the work requested by the matching capability. Follow the capability profile metadata for agent, mentions, and safety limits. The owning goal or loop decides when this runs.

# Final message format (required)

Your final message must use this exact shape:

```
DONE
PR_SUMMARY:
- <short summary of what happened>
```

If you cannot complete the run, output one line instead:

```
FAILED: <reason>
```


---

# security-audit

Coordinate a security posture sweep covering dependencies, application code, and supply chain risks.
