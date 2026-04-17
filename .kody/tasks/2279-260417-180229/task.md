# [live-observability-0.4.0] Observability smoke: append HTML comment to README

Observability smoke test for engine 0.4.0.

## Task

Append a single-line HTML comment at the end of `README.md`:

```html
<!-- kody observability smoke 0.4.0 2026-04-17 -->
```

Make no other changes.

## Acceptance

- `README.md` ends with exactly that comment line
- No unrelated diffs
- Pipeline completes and produces a PR

Running this primarily to verify the new observability diagnostics work end-to-end in GitHub Actions:
- per-stage `agent-{stage}.{attempt}.jsonl` logs land correctly
- `failureCategory` in `status.json` / summary if any stage fails / retries
- crash dumps on abort

---

## Discussion (2 comments)

**@aguyaharonyair** (2026-04-17):
@kody

**@aharonyaircohen** (2026-04-17):
🚀 Kody pipeline started: `2279-260417-180229`

