# [run-20260407-1802] T24: Decompose fallback for simple task

## Task
Test decompose on a simple task that should fall back to normal pipeline.

## Task Description
Add a `capitalizeFirstLetter` utility function in src/utils/capitalize-first.ts that takes a string and capitalizes only the first letter.

## Command
Comment on this issue: @kody decompose

## Expected
- complexity_score < 6 or not decomposable
- Falls back to normal pipeline via runPipeline()
- PR created normally
- No parallel build attempted