# [run-20260407-1802] T26: Decompose --no-compose flag

## Task
Test decompose with --no-compose flag.

## Task Description
Same as T25 - Add a complete notification system spanning 4+ files in 2+ directories.

## Command
Comment on this issue: @kody decompose --no-compose

## Expected
- Parallel builds complete
- decompose-state.json saved
- NO merge/verify/review/ship phases
- No PR created
- Sub-task branches exist on remote