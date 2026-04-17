# Plan: Inject --feedback flag into build stage logs

## Context

The task asks to verify that `--feedback` is injected into the build stage, emitting a `feedback:` log line. After investigating the full codebase, I found:

- **This repo** (`Kody-Engine-Tester`) is a Next.js/Payload CMS application with `@kody-ade/engine` as a dev dependency (compiled npm package in `node_modules`).
- **The Kody Engine source** (`src/cli.ts`, `src/pipeline/context.ts`, `src/stages/build.ts`) does NOT exist in this repo — only the compiled output is available at `node_modules/@kody-ade/engine/dist/bin/cli.js` (19,475 lines).
- **The `--feedback` feature is already fully implemented** in the compiled engine (see below).

## How the Feature Already Works (compiled engine analysis)

Tracing `kody run --feedback "..."` through `cli.js`:

1. **CLI parsing** (`parseArgs` ~line 17538):
   ```js
   feedback: getArg3(args2, "--feedback") ?? process.env.FEEDBACK
   ```

2. **Context creation** (`main`/`run` command ~line 19246):
   ```js
   const ctx = {
     input: {
       // ...
       feedback: input.feedback,   // ← carried into context
       // ...
     }
   }
   ```

3. **Build stage log** (`executeAgentStage` ~lines 14742–14743):
   ```js
   if (ctx.input.feedback && def.name === "build") {
     logger.info(`  feedback: ${ctx.input.feedback.slice(0, 200)}${...}`);
   }
   ```

4. **Prompt injection** (`buildFullPrompt` ~line 14371): `feedback` is also threaded into the agent prompt.

## What Needs to Be Done

The feature is already complete in the compiled engine. **No source files exist in this repo to modify.** To verify the feature works:

1. Run the compiled `kody-engine` CLI directly with `--feedback`:
   ```bash
   cd /home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester
   node_modules/.bin/kody-engine run --task-id test-feedback --task "echo test" --feedback "Use functional style" --local
   ```
   Then check the build-stage output for `feedback: Use functional style`.

2. Since the engine source lives at `github.com/aharonyaircohen/Kody-Engine-Lite` (per `kody.config.json` schema URL), any changes to `src/cli.ts`, `src/pipeline/context.ts`, `src/stages/build.ts` must be made in **that repo**, not here.

## Verification

- Run the pipeline with `--feedback "test"` and confirm `feedback: test` appears in build-stage logs.
- Alternatively, run `grep -n "feedback:" node_modules/@kody-ade/engine/dist/bin/cli.js` to confirm the log line exists at the expected line numbers.
