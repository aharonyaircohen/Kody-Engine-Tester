# LearnHub LMS Testing Strategy

## Stack

- **Integration**: Vitest 4.0 (`vitest.config.mts`, `environment: jsdom`, `setupFiles: ./vitest.setup.ts`) — `pnpm test:int`
- **E2E**: Playwright 1.58 (`playwright.config.ts`, chromium) — `pnpm test:e2e`
- **Runner**: `pnpm test` executes both suites sequentially

## Organization

| Type              | Location                                | Pattern                                       |
| ----------------- | --------------------------------------- | --------------------------------------------- |
| Unit/Integration  | `src/**/*.test.ts`, `src/**/*.test.tsx` | Co-located with source                        |
| Integration Specs | `tests/int/**/*.int.spec.ts`            | Dedicated integration folder                  |
| E2E               | `tests/e2e/*.spec.ts`                   | Page-object style helpers in `tests/helpers/` |

## Patterns

- **Mocks**: `vi.fn()` + `mockResolvedValue` / `mockRejectedValue` for Payload SDK stubs
- **Fixtures**: `seedTestUser()` / `cleanupTestUser()` pattern for E2E test data lifecycle
- **Fake Timers**: `vi.useFakeTimers()` / `vi.advanceTimersByTimeAsync()` for async queue tests
- **Browser Context**: Shared `Page` instance via `browser.newContext()` in `beforeAll`
- **Helpers**: `tests/helpers/login.ts` encapsulates auth flow for E2E

## CI Quality Gates

- `pnpm ci` runs `payload migrate` → `pnpm build` → `pnpm test`
- Playwright `forbidOnly: true` prevents committed `.only()` tests
- Retries enabled on CI (2x) to reduce flaky failure noise
- `kody-watch.yml` runs scheduled E2E via `pnpm dev` on `localhost:3000`

## Coverage

- No explicit threshold configured; vitest run passes `--coverage` implicitly
- Example coverage: `CourseSearchService` tested via mocked Payload find calls
