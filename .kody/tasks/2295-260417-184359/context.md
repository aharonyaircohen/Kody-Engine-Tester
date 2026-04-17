
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
