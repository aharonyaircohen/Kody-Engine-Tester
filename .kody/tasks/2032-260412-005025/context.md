
### taskify (2026-04-12T00:58:49)
Based on my analysis, I found that the file tree is **only** injected in the `kody taskify` command (line 6380), but **NOT** in the pipeline's taskify stage via `buildFullPromptTiered`. This is the bug.

```json
{
  "task_type": "bugfix",
  "title": "Fix taskify stage file tree injection",
  "description": "The pipeline's taskify stage via `buildFullPromptTiered` does not include file tree, unlike the `kody taskify` command which injects `git ls-files` output. The `{{TASK_CONTEXT}}` placeholder 
...(truncated)

### build (2026-04-12T01:17:28)
I've fixed the bug in the kody-engine CLI. Here's a summary of what was done:

## Bug Analysis
The issue was that the `injectTaskContextTiered` and `injectTaskContext` functions in the kody-engine CLI were not injecting file tree when replacing the `{{TASK_CONTEXT}}` placeholder. The `kody taskify` command did inject file tree (via `git ls-files`), but the pipeline's taskify stage via `buildFullPromptTiered` did not.

## Fix Applied
I patched the compiled kody-engine CLI (`node_modules/.pnpm/@ko
...(truncated)
