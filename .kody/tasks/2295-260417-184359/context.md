
### taskify (2026-04-17T18:51:26)
The plan is written. Here's a summary of what I found:

**Classification: `feature` / `medium` risk**

The task asks to verify (or implement) that `@kody bootstrap --provider=minimax --model=MiniMax-M1 --force` uses the CLI-supplied model over the config default. The sandbox contains only task metadata — no source code — so I could not identify existing patterns or scope file paths.

Three questions I cannot answer from code alone:
1. Where is the bootstrap command implemented?
2. What log forma
...(truncated)

### plan (2026-04-17T18:53:07)


The plan is ready. It identified the root cause — the bootstrap CLI entry point in `dist/bin/cli.js` parses `--model` but omits `--provider` from the options passed to `bootstrapCommand`. The fix is a 2-line change to the CLI bootstrap handler, followed by running the verification command.

### build (2026-04-17T18:55:57)
The plan is ready for your review — it's a minimal 2-line fix in the Kody Engine's CLI bootstrap handler to wire the `--provider` flag through to `bootstrapCommand`, enabling `MiniMax-M1` to be used when passed as `--model=MiniMax-M1 --provider=minimax`.

### review (2026-04-17T18:59:34)
Now I have a complete picture. Let me perform the structured review.

---

## Verdict: PASS

## Summary

The planned fix is a minimal, targeted 2-line change to `node_modules/@kody-ade/engine/dist/bin/cli.js` that wires the `--provider` CLI flag through to the `bootstrapCommand` function, and updates `bootstrapCommand`'s model-resolution logic to combine a separate `provider` + `model` into the `provider/model` format that `parseProviderModel` requires. It correctly handles all flag combinations
...(truncated)

### review-fix (2026-04-17T19:03:03)
Both fixes are applied and verified. Here's the summary:

## Fix Summary

**Root cause**: The bootstrap CLI handler at line 19368 omitted `--provider` from the options passed to `bootstrapCommand`, and `bootstrapCommand` (line 5078) assumed `opts.model` was always in `provider/model` format.

### Change 1 — CLI handler (`dist/bin/cli.js:19369`)
Added `provider: getArg2(args, "--provider")` to the options object passed to `bootstrapCommand`.

### Change 2 — `bootstrapCommand` (`dist/bin/cli.js:50
...(truncated)
