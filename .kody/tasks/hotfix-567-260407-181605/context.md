
### build (2026-04-07T18:20:22)
## Test Results: T40 Release Dry-Run ✅ PASSED

The `kody-engine release --dry-run` command was executed and verified successfully:

| Check | Expected | Actual |
|-------|----------|--------|
| mode=release, dry_run=true | `[dry-run]` prefix | ✅ `[dry-run]` shown on all actions |
| Commit parsing shows bump type | feat→minor, fix→patch | ✅ `1.0.0 → 1.1.0 (minor)` |
| [dry-run] prefix on all actions | Yes | ✅ Multiple `[dry-run]` prefixes |
| No PR created | 0 PRs | ✅ No PR created |
| No tags cr
...(truncated)
