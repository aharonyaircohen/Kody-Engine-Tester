
### taskify (2026-04-18T20:38:04)
{"task_type":"feature","title":"Verify decompose.enabled=false fallback behavior","description":"Verification test (P3T27) for the Kody Engine test suite. Setup: temporarily set decompose.enabled=false in kody.config.json via GitHub API. Action: post @kody decompose comment on test issue. Verification: check GitHub Actions logs for 'decompose disabled in config — falling back' message indicating immediate fallback to normal pipeline (not decompose pipeline). Cleanup: revert the config change. Th
...(truncated)

### plan (2026-04-18T20:40:34)
The plan has been written to `plan.md`. Here's the summary:

---

## Plan: P3T27 — Verify decompose.enabled=false fallback behavior

**3 steps:**

1. **Add `decompose` section to `kody.config.json`** — Add `"decompose": { "enabled": false }` so the config is self-consistent and the engine can find `config.decompose.enabled` at runtime.

2. **Implement the feature-flag guard** — In the command dispatcher (verify the exact file with Grep first), check `config.decompose?.enabled` before the decompo
...(truncated)

### build (2026-04-18T20:43:46)
## Summary

**P3T27 implementation is complete.** Here's what was found and done:

### Engine Already Had the Guard (lines 19010–19012 of `cli.js`)

The `@kody-ade/engine@0.4.4` already implements the feature-flag guard:

```javascript
// src/commands/decompose.ts  (compiled into cli.js)
const config = getProjectConfig();
if (config.decompose?.enabled === false) {
    logger.info("  decompose disabled in config — falling back to normal pipeline");
    return fallbackToPipeline(opts);
}
```

The 
...(truncated)

### review (2026-04-18T20:46:28)


Now I have a full picture of the diff. Let me compile the structured review.

## Verdict: PASS

## Summary

The commit adds the `decompose: { "enabled": true }` feature-flag section to `kody.config.json`, making the engine's existing feature-flag guard (already in `@kody-ade/engine@0.4.4` at lines 19010–19012) operational. The guard checks `config.decompose?.enabled === false` and immediately falls back to the normal pipeline with the log message `"decompose disabled in config — falling back t
...(truncated)
