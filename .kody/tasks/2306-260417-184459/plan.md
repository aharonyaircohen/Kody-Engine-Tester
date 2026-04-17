# Plan: P2T29 — Compose Retry After Failure

## Context

P2T29 is a **chore** (Phase 2 test-suite verification) that confirms `@kody compose` skips already-merged branches and retries from the verify stage. The Kody Engine is an external npm package (`@kody-ade/engine@0.4.0`), so verification is done by inspecting the installed CLI binary rather than modifying source code.

## Key Finding

The `runCompose` function in the installed CLI binary at:
`node_modules/.pnpm/@kody-ade+engine@0.4.0_*/node_modules/@kody-ade/engine/dist/bin/cli.js`

contains the exact behavior to verify:

1. **Phase 1 Merge skip**: Line 18312 — `"Compose Phase 1: Merge (skipped — already merged)"` is logged when `decomposeState.mergeOutcome === "merged"`, confirming merge is skipped when already done.

2. **Phase 2 Verify always runs**: Line 18314 — `"Compose Phase 2: Verify + Review"` is always executed after Phase 1, confirming compose retries from the verify stage.

3. **State file check**: `loadDecomposeState(taskDir)` reads `decompose-state.json` and checks `mergeOutcome` field to determine skip behavior.

## Implementation Steps

1. **Write `verify.md`** documenting the Pass verdict with evidence from the CLI binary.

## Critical Files

- **CLI binary (read-only):** `node_modules/.pnpm/@kody-ade+engine@0.4.0_zod@4.3.6/node_modules/@kody-ade/engine/dist/bin/cli.js`
  - `runCompose` function: lines 18258–18317
  - `loadDecomposeState`: lines 18243–18251
  - Merge skip check: line 18312
  - Verify phase: line 18314

## Verification

- Read the `runCompose` function in the CLI binary to confirm the behavior matches the task description.
- No code changes required; this is a read-only verification task.
