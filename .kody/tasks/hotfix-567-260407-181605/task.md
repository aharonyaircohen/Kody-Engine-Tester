# [run-20260407-1802] T40: Release dry-run

## Task
Test release --dry-run to verify it analyzes commits without side effects.

## Precondition
Tester repo has conventional commits since last tag (T01/T02 PRs have feat:/fix: commits).

## Command
Comment on this issue: @kody release --dry-run

## Expected
- mode=release, dry_run=true
- Commit parsing shows bump type (feat→minor, fix→patch)
- [dry-run] prefix on all actions
- No PR created, no tags created, no files modified
- Version preview shown