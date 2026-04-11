
### taskify (2026-04-11T20:55:16)
All acceptance criteria are met:

| Criterion | Status |
|-----------|--------|
| Mode is release, dry_run is true | `[dry-run] Starting release...` and `Dry run complete.` |
| Logs show commit parsing and bump determination | `100 commits since beginning`, `1.0.0 → 1.1.0 (minor)` |
| No PR created | dry-run only shows `Would create PR: release/v1.1.0 → main`, no actual PR |
| No version files modified | `package.json` and `CHANGELOG.md` unchanged in git status |
| No tags created | No new tags 
...(truncated)

### build (2026-04-11T20:56:33)
## Verification Complete

All 5 acceptance criteria for `@kody release --dry-run` are verified:

| Criteria | Status | Evidence |
|----------|--------|----------|
| Mode is release, dry_run is true | ✓ | `[dry-run]` prefix in all log entries |
| Logs show commit parsing and bump determination | ✓ | "100 commits since beginning", "1.0.0 → 1.1.0 (minor)" |
| No PR created | ✓ | `[dry-run] Would create PR: release/v1.1.0 → main` (would-wouldn't) |
| No version files modified | ✓ | `git diff package
...(truncated)

### autofix (2026-04-11T21:01:46)
Based on my root cause investigation, I need to clarify an important finding:

## Phase 1 — Root Cause Investigation

**Error:** `Failed query: SELECT conname AS primary_key... there is no parameter $1`

**Investigation:**
- The error originates from `tests/int/api.int.spec.ts` line 15 when calling `payload.find({ collection: 'users' })`
- The query in question is **NOT** present in `tests/int/api.int.spec.ts` — the file only contains 21 lines with a simple `payload.find()` call
- The `pg_constr
...(truncated)
