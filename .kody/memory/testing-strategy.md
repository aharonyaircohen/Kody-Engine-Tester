# Testing Strategy

## Stack

- **Integration**: Vitest 4.0.18 (`vitest.config.mts`) — `pnpm test:int`
- **E2E**: Playwright 1.58.2 (`playwright.config.ts`) — `pnpm test:e2e`
- **Runner**: `pnpm test` executes both suites sequentially

## Organization

| Type             | Location                                | Pattern                                       |
| ---------------- | --------------------------------------- | --------------------------------------------- |
| Unit/Integration | `src/**/*.test.ts`, `src/**/*.test.tsx` | Co-located with source                        |
| E2E              | `tests/e2e/*.spec.ts`                   | Page-object style helpers in `tests/helpers/` |

## Patterns

- **Mocks**: `vi.fn()` + `mockResolvedValue` / `mockRejectedValue` for Payload SDK stubs
- **Fixtures**: `seedTestUser()` / `cleanupTestUser()` pattern for E2E test data (defined in `tests/helpers/seedUser.ts`)
- **Fake Timers**: `vi.useFakeTimers()` for async queue tests (e.g., `RetryQueue` in `src/utils/retry-queue.test.ts`)
- **Browser Context**: Shared `Page` instance via `browser.newContext()` in `beforeAll`
- **Login Helper**: `tests/helpers/login.ts` wraps authenticated page navigation

## CI Quality Gates

- `payload migrate && pnpm build` runs before test execution on merge to `main`/`dev`
- Playwright `forbidOnly: true` prevents committed `.only()` tests
- Retries enabled on CI (2x) to reduce flaky failure noise
- WebServer defined in `playwright.config.ts` launches `pnpm dev` before E2E suite

## Coverage

- No explicit threshold configured; vitest reports coverage when run
- Example: `CourseSearchService` tested via mocked Payload find calls
- Unit tests cover utilities (`src/utils/url-parser.test.ts`, `src/utils/retry-queue.test.ts`)

## E2E Test Examples

- `tests/e2e/admin.e2e.spec.ts` — Payload admin panel navigation (dashboard, list, edit views)
- `tests/e2e/frontend.e2e.spec.ts` — Public homepage smoke test
