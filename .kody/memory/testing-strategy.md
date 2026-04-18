## Setup Files

- `vitest.setup.ts` — shared test setup loaded for all vitest runs (configured in `vitest.config.mts`)

## Test Helpers

- `tests/helpers/login.ts` — authenticates a user for E2E tests
- `tests/helpers/seedUser.ts` — creates/tears down test user via `seedTestUser()` / `cleanupTestUser()`
- Example usage in `tests/e2e/admin.e2e.spec.ts`: `browser.newContext()` + `login({ page, user: testUser })` in `beforeAll`

## Additional Test Examples

- `src/utils/url-parser.test.ts` — unit tests for URL parsing with `describe`/`it`/`expect`
- `src/utils/retry-queue.test.ts` — fake timer tests using `vi.useFakeTimers()` + `vi.advanceTimersByTimeAsync()` for async queue behavior
