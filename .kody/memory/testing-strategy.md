# LearnHub LMS Testing Strategy

## Stack

- **Integration**: Vitest 4.0.18 (`vitest.config.mts`) — `pnpm test:int`
- **E2E**: Playwright 1.58.2 (`playwright.config.ts`) — `pnpm test:e2e`
- **Unit/Integration Location**: `src/**/*.test.ts`, `src/**/*.test.tsx` co-located with source
- **Integration Specs**: `tests/int/**/*.int.spec.ts`
- **E2E**: `tests/e2e/*.spec.ts` with page-object helpers in `tests/helpers/`
- **Runner**: `pnpm test` executes lint + `pnpm test:int` + `pnpm test:e2e` sequentially

## Patterns

- **Mocks**: `vi.fn()` + `mockResolvedValue` / `mockRejectedValue` for Payload SDK stubs
- **Fixtures**: `seedTestUser()` / `cleanupTestUser()` pattern for E2E test data; `login()` helper in `tests/helpers/login`
- **Fake Timers**: `vi.useFakeTimers()` + `vi.advanceTimersByTimeAsync()` for async queue tests (e.g., `RetryQueue`)
- **Browser Context**: Shared `Page` instance via `browser.newContext()` in `beforeAll`

## CI Quality Gates

- `payload migrate` → `pnpm build` → `pnpm test` pipeline
- Playwright `forbidOnly: true` prevents committed `.only()` tests
- CI retries 2x; dev retries 0x
- Runs on push to `main`/`dev` for `src/**`, `kody.config.json`, `package.json`

## Coverage

- No explicit threshold; vitest run passes `--coverage` implicitly
- Example coverage: `CourseSearchService` tested via mocked Payload find calls
