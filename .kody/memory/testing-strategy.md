# LearnHub LMS Testing Strategy

## Stack

- **Integration**: Vitest 4.0.18 (`vitest.config.mts`) — `pnpm test:int`
- **E2E**: Playwright 1.58.2 (`playwright.config.ts`) — `pnpm test:e2e`
- **Runner**: `pnpm test` executes both suites sequentially (`test:int` → `test:e2e`)

## Organization

| Type              | Location                                | Pattern                                       |
| ----------------- | --------------------------------------- | --------------------------------------------- |
| Unit/Integration  | `src/**/*.test.ts`, `src/**/*.test.tsx` | Co-located with source                        |
| Integration Specs | `tests/int/**/*.int.spec.ts`            | Dedicated integration folder                  |
| E2E               | `tests/e2e/*.spec.ts`                   | Page-object style helpers in `tests/helpers/` |

## Patterns

- **Mocks**: `vi.fn()` + `mockResolvedValue` / `mockRejectedValue` for Payload SDK stubs
- **Fixtures**: `seedTestUser()` / `cleanupTestUser()` pattern for E2E test data (defined in `tests/helpers/`)
- **Fake Timers**: `vi.useFakeTimers()` for async queue tests (e.g., `RetryQueue`)
- **Browser Context**: Shared `Page` instance via `browser.newContext()` in `beforeAll`
- **E2E Helpers**: `tests/helpers/login.ts` wraps authentication flow; `tests/helpers/seedUser.ts` manages test user lifecycle

## CI Quality Gates

- `pnpm test` is required to pass before merge (run via `test-ci.yml` on PR)
- Playwright `forbidOnly: true` prevents committed `.only()` tests
- Retries enabled on CI (2x) to reduce flaky failure noise
- `kody.yml` workflow triggers on `push` to `main`/`dev` and `pull_request` closed, running full pipeline via Kody engine

## Coverage

- No explicit threshold configured; vitest run passes `--coverage` implicitly
- Example coverage: `CourseSearchService` tested via mocked Payload find calls
