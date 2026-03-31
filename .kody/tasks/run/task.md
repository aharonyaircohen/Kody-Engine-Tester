# Verify fix: getModifiedFiles uses staged+unstaged diff

## Context
kody-engine-lite v0.1.82 fixed `getModifiedFiles()` in `observer.ts`.

Previously it used `git diff --name-only HEAD~1` which compared against the previous commit — but the build stage hasn't committed yet when verify runs. This caused the failure diagnosis agent to get an empty or wrong file list, making classification unreliable.

Now it uses `git diff --name-only --cached` + `git diff --name-only` to capture all staged and unstaged changes.

## Verification
Create a task that will intentionally need an autofix cycle (e.g., a change that introduces a lint error). Verify that:
1. The verify stage's failure diagnosis correctly identifies which files were modified
2. The autofix agent receives accurate file context

## Task
Add a new utility function `formatDate(date: Date): string` to `src/lib/utils.ts` that formats a date as `YYYY-MM-DD`. The function should use template literals. Include a unit test.
