# [run-20260407-2330] T13: State bypass on rerun

## Task
Add a `pick` utility function in src/utils/pick.ts that picks specific keys from an object.

## Complexity
low

## Acceptance Criteria
- pick({a: 1, b: 2, c: 3}, ['a', 'c']) returns {a: 1, c: 3}
- Full test coverage

---

## Discussion (8 comments)

**@aguyaharonyair** (2026-04-07):
@kody

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `735-260407-205054` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24103762346))

To rerun: `@kody rerun 735-260407-205054 --from <stage>`

**@aharonyaircohen** (2026-04-07):
⚡ **Complexity: low** — skipping plan, review, review-fix (not needed for low-risk tasks)

**@aharonyaircohen** (2026-04-07):
⚠️ **Infrastructure issue detected:** drizzle-kit is failing to query PostgreSQL system tables because required parameters ($1, $2) are not being provided to the database introspection query

Ensure the database connection string and schema name are properly configured for drizzle-kit. The query requires connamespace ($1) and relname ($2) parameters which are missing. Check that DATABASE_URL or equivalent environment variable is set and the target schema is specified.

**@aharonyaircohen** (2026-04-07):
🎉 PR created: https://github.com/aharonyaircohen/Kody-Engine-Tester/pull/740

**@aharonyaircohen** (2026-04-07):
## Pipeline Summary: `735-260407-205054`

| Stage | Status | Duration | Retries |
|-------|--------|----------|---------|
| taskify | completed | - | 0 |
| plan | completed | - | 0 |
| build | completed | - | 0 |
| verify | completed | - | 0 |
| review | completed | - | 0 |
| review-fix | completed | - | 0 |
| ship | completed | - | 0 |

**Total:** 0s | **Complexity:** low | **Model:** MiniMax-M2.7-highspeed

**@aguyaharonyair** (2026-04-07):
@kody rerun 735-260407-205054

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `735-260407-205054` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24104020578))

To rerun: `@kody rerun 735-260407-205054 --from <stage>`

