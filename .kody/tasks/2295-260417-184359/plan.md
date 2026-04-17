# Plan: Bootstrap model override — fix --provider flag passthrough

## Context

When running `@kody bootstrap --provider=minimax --model=MiniMax-M1 --force`, the `--provider` flag is ignored. The root cause is in `node_modules/@kody-ade/engine/dist/bin/cli.js` (the published build of the Kody Engine):

- **Line ~19368** (CLI handler): parses `--model` and `--force` but omits `--provider` from the options passed to `bootstrapCommand`.
- **Line ~5078** (`bootstrapCommand`): uses `opts.model ? parseProviderModel(opts.model) : ...` — when `opts.model` is just `"MiniMax-M1"` (no `provider/` prefix), `parseProviderModel` throws because it requires the `provider/model` format.

## Fix (2-line change in `dist/bin/cli.js`)

### Change 1 — CLI handler (~line 19368)

Add `provider: getArg2(args, "--provider")` to the options object passed to `bootstrapCommand`.

```js
bootstrapCommand({
  force: args.includes("--force"),
  model: getArg2(args, "--model"),
  provider: getArg2(args, "--provider")  // ← NEW
}, PKG_ROOT)
```

### Change 2 — bootstrapCommand (~line 5078)

Update the model resolution logic to prepend the CLI-supplied `provider` when the model has no `/` separator:

```js
const bootstrapStageConfig =
  opts.model
    ? parseProviderModel(opts.provider && !opts.model.includes("/")
        ? `${opts.provider}/${opts.model}`
        : opts.model)
    : resolveStageConfig(config, "bootstrap", "cheap");
```

## Files

| File | Change |
|------|--------|
| `node_modules/@kody-ade/engine/dist/bin/cli.js` | 2-line fix (CLI handler + bootstrapCommand) |

## Verification

After applying the fix, run the bootstrap command and confirm the log line shows the correct model:

```bash
cd /home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester
pnpm exec kody bootstrap --provider=minimax --model=MiniMax-M1 --force
```

Expected log output:
```
  Model: MiniMax-M1 (provider: minimax)
```

The log at line ~5085 (`console.log(\`  Model: ${bootstrapModel} (provider: ${bootstrapStageConfig.provider})\`)`) will confirm MiniMax-M1 is used and not the config default.
