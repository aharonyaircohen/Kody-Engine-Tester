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
- **E2E Helpers**: `tests/helpers/login.ts`, `tests/helpers/seedUser.ts` for auth and test user lifecycle

## Vitest Configuration

- Setup file: `vitest.setup.ts` loaded before test suite
- Environment: `jsdom`
- Include patterns: `src/**/*.test.ts`, `src/**/*.test.tsx`, `tests/**/*.test.ts`, `tests/int/**/*.int.spec.ts`

## Playwright Configuration

- `webServer` auto-starts `pnpm dev` on port 3000 for E2E tests
- `forbidOnly: true` prevents committed `.only()` tests
- Retries: 2x on CI, 0 locally
- Chromium only via `Desktop Chrome` channel

## CI Quality Gates

- `pnpm ci` runs `payload migrate` → `pnpm build` → `pnpm test`
- Playwright `forbidOnly: true` prevents committed `.only()` tests
- Retries enabled on CI (2x) to reduce flaky failure noise
- `kody-watch` schedule runs every 30 minutes; `kody-ci` triggers on PR close, review, issue comment, and push to main/dev

## Coverage

- No explicit threshold configured; vitest run passes `--coverage` implicitly
- Example coverage: `CourseSearchService` tested via mocked Payload find calls
