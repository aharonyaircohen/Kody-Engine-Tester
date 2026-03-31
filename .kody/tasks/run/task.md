# Verify fix: Config deep-merge preserves default modelMap

## Context
kody-engine-lite v0.1.82 fixed config deep-merging for `agent.modelMap`.

Previously, if a user's `kody.config.json` had `agent: { provider: "openai" }` without specifying `modelMap`, the shallow spread would lose the default modelMap (cheap/mid/strong tier mappings), causing model resolution failures.

Now `modelMap` is deep-merged: `{ ...DEFAULT_CONFIG.agent.modelMap, ...raw.agent?.modelMap }`.

## Verification
This fix is structural (config loading). To verify it works, simply run any @kody command — if model resolution succeeds, the fix is working.

## Task
Add a `truncateText(text: string, maxLength: number): string` function to `src/lib/utils.ts` that truncates text and adds "..." if it exceeds maxLength. Include a unit test.
