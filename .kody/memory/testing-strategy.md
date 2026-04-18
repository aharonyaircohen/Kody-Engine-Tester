# LearnHub LMS Testing Strategy

## Stack

- **Integration**: Vitest 4.0 (`vitest.config.mts`) — `pnpm test:int`
- **E2E**: Playwright 1.58 (`playwright.config.ts`) — `pnpm test:e2e`
- **Runner**: `pnpm test` executes both suites sequentially

## Organization

| Type              | Location                                | Pattern                                       |
| ----------------- | --------------------------------------- | --------------------------------------------- |
| Unit/Integration  | `src/**/*.test.ts`, `src/**/*.test.tsx` | Co-located with source                        |
| Integration Specs | `tests/int/**/*.int.spec.ts`            | Dedicated integration folder                  |
| E2E               | `tests/e2e/*.spec.ts`                   | Page-object style helpers in `tests/helpers/` |

## Patterns

- **Mocks**: `vi.fn()` + `mockResolvedValue` / `mockRejectedValue` for Payload SDK stubs
- **Fixtures**: `seedTestUser()` / `cleanupTestUser()` pattern for E2E test data
- **Fake Timers**: `vi.useFakeTimers()` for async queue tests (e.g., `RetryQueue`)
- **Browser Context**: Shared `Page` instance via `browser.newContext()` in `beforeAll`

## CI Quality Gates

- `pnpm ci` runs `payload migrate` → `pnpm build` → `pnpm test`
- Playwright `forbidOnly: true` prevents committed `.only()` tests
- Retries enabled on CI (2x) to reduce flaky failure noise

## Coverage

- No explicit threshold configured; vitest run passes `--coverage` implicitly
- Example coverage: `CourseSearchService` tested via mocked Payload find calls

## Vitest Include Scope

Vitest config (`vitest.config.mts`) includes:

- `src/**/*.test.ts` — unit tests co-located with source
- `src/**/*.test.tsx` — React component tests
- `tests/**/*.test.ts` — general test helpers/utilities
- `tests/int/**/*.int.spec.ts` — integration specs with `.int.spec.ts` suffix

## Playwright Configuration

- Browser: Chromium only (`channel: 'chromium'`)
- `trace: 'on-first-retry'` for debugging failed tests
- WebServer: `pnpm dev` on `http://localhost:3000`
- Helpers in `tests/helpers/` (e.g., `login.ts`, `seedUser.ts`) provide reusable auth and setup logic

## Example Test Files

- `tests/e2e/admin.e2e.spec.ts` — E2E admin navigation with auth via `login()` helper
- `tests/e2e/frontend.e2e.spec.ts` — E2E homepage smoke test
- `src/utils/url-parser.test.ts` — URL parsing unit tests with full component coverage
- `src/utils/retry-queue.test.ts` — Async queue with fake timers (`vi.useFakeTimers`)
