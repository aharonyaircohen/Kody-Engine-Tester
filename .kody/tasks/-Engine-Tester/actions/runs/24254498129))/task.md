# [mem-20260410-1656] M02: Add token expiry checker

Create `isTokenExpired(token: string): boolean` in `src/auth/token-utils.ts` that decodes JWT and checks exp claim. With tests

---

## Discussion (32 comments)

*Showing first 5 and last 10 of 32 comments*

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1773-260410-165635` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24254220772))

To rerun: `@kody rerun 1773-260410-165635 --from <stage>`

**@aharonyaircohen** (2026-04-10):
⚡ **Complexity: low** — skipping plan, review, review-fix (not needed for low-risk tasks)

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24254220772))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24254290135))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24254220772)) --from <stage>`

**@aharonyaircohen** (2026-04-10):
⚡ **Complexity: low** — skipping plan, review, review-fix (not needed for low-risk tasks)

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24254442852))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24254599658))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24254442852)) --from <stage>`

**@aharonyaircohen** (2026-04-10):
⚡ **Complexity: low** — skipping plan, review, review-fix (not needed for low-risk tasks)

**@aharonyaircohen** (2026-04-10):
⚠️ **Infrastructure issue detected:** Integration test `tests/int/api.int.spec.ts` is failing because drizzle-kit is executing a SQL query with $1 parameter placeholder but no parameters were provided - the test database is not properly configured with required parameters.

The test database connection needs to be configured with proper namespace/schema parameters for the pg_constraint query. This is an infrastructure issue - the test environment's database connection string or migration setup is missing required configuration.

**@aharonyaircohen** (2026-04-10):
⚠️ **Infrastructure issue detected:** The integration test requires a PostgreSQL database connection with proper namespace/schema parameters for drizzle-kit introspection, but the test is connecting to a database that cannot resolve the $1 parameter in the pg_constraint query.

Set up a PostgreSQL database for the integration tests and ensure the database connection includes the required namespace/schema parameter ($1::regnamespace) that the drizzle-kit introspection query expects. The test file tests/int/api.int.spec.ts runs against a real database that is not available in this environment.

**@aharonyaircohen** (2026-04-10):
✅ Fix pushed to PR #1781: https://github.com/aharonyaircohen/Kody-Engine-Tester/pull/1781

**@aharonyaircohen** (2026-04-10):
## Pipeline Summary: `-Engine-Tester/pull/1781`

| Stage | Status | Duration | Retries |
|-------|--------|----------|---------|
| taskify | completed | - | 0 |
| plan | completed | - | 0 |
| build | completed | - | 0 |
| verify | completed | - | 0 |
| review | completed | - | 0 |
| review-fix | completed | - | 0 |
| ship | failed | - | 0 |

**Total:** 0s | **Complexity:** low | **Model:** MiniMax-M2.7-highspeed

**@aharonyaircohen** (2026-04-10):
❌ Pipeline failed at **ship**: Command failed: git push --force-with-lease -u origin HEAD
To https://github.com/aharonyaircohen/Kody-Engine-Tester
 ! [rejected]        HEAD -> 1773--mem-20260410-1656-m02-add-token-expiry-checke (st

**@aharonyaircohen** (2026-04-10):
## Pipeline Summary: `-Engine-Tester`

| Stage | Status | Duration | Retries |
|-------|--------|----------|---------|
| taskify | completed | - | 0 |
| plan | completed | - | 0 |
| build | completed | - | 0 |
| verify | completed | - | 0 |
| review | completed | - | 0 |
| review-fix | completed | - | 0 |
| ship | completed | - | 0 |

**Total:** 0s | **Complexity:** low | **Model:** MiniMax-M2.7-highspeed | **Run:** #3 of 3 attempts

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `-Engine-Tester` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24254662480))

To rerun: `@kody rerun -Engine-Tester --from <stage>`

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24254498129))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24254664597))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24254498129)) --from <stage>`

