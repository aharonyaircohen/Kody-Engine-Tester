
### taskify (2026-04-18T11:55:43)
{"task_type":"feature","title":"Verify decompose.enabled=false fallback behavior","description":"Verify that when decompose.enabled=false is set in kody.config.json, the @kody decompose command immediately falls back to the normal pipeline without attempting decomposition. Verification: pipeline logs show 'decompose disabled in config — falling back'. This is P3T27 — a test case from the Kody Engine nightly test suite that validates the decompose config flag gates the feature correctly.","scope"
...(truncated)

### build (2026-04-18T11:58:11)

The implementation is complete. Here's what was done:

**Change made to `kody.config.json`** — added the `decompose` section with `enabled: false`:

```json
"decompose": {
  "enabled": false
}
```

**How it works**: The `@kody-ade/engine` CLI (v0.4.4) already has the check at line 19010-19011 in its compiled CLI:

```javascript
if (config.decompose?.enabled === false) {
    logger.info("  decompose disabled in config — falling back to normal pipeline");
    return fallbackToPipeline(opts);
}
``
...(truncated)
