# LearnHub LMS Testing Strategy

## Stack

- **Integration**: Vitest 4.0 (`vitest.config.mts`) — `pnpm test:int`
- **E2E**: Playwright 1.58 (`playwright.config.ts`) — `pnpm test:e2e`
- **Linting**: ESLint ^9.16.0 (`pnpm lint`)
- **Formatting**: Prettier ^3.4.2
- **Runner**: `pnpm test` executes `test:int` then `test:e2e` sequentially

## Organization

| Type              | Location                                | Pattern                                       |
| ----------------- | --------------------------------------- | --------------------------------------------- |
| Unit/Integration  | `src/**/*.test.ts`, `src/**/*.test.tsx` | Co-located with source                        |
| Integration Specs | `tests/int/**/*.int.spec.ts`            | Dedicated integration folder                  |
| E2E               | `tests/e2e/*.spec.ts`                   | Page-object style helpers in `tests/helpers/` |

## Patterns

- **Vitest Setup**: `vitest.setup.ts` loaded as setup file; environment `jsdom`
- **Mocks**: `vi.fn()` + `mockResolvedValue` / `mockRejectedValue` for Payload SDK stubs
- **Fixtures**: `seedTestUser()` / `cleanupTestUser()` pattern for E2E test data
- **Fake Timers**: `vi.useFakeTimers()` / `vi.useRealTimers()` for async queue tests (e.g., `RetryQueue`)
- **Browser Context**: Shared `Page` instance via `browser.newContext()` in `beforeAll`
- **URL Parsing Tests**: Example at `src/utils/url-parser.test.ts` with `describe`/`it`/expect

## CI Quality Gates

- `pnpm ci` runs `payload migrate` → `pnpm build` → `pnpm lint` → `pnpm test`
- Playwright `forbidOnly: true` prevents committed `.only()` tests
- Retries enabled on CI (2x) to reduce flaky failure noise

## Coverage

- No explicit threshold configured; vitest run passes `--coverage` implicitly
- Example coverage: `CourseSearchService` tested via mocked Payload find calls
