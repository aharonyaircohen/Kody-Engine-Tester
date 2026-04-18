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

## Kody Engine Test Suite

The project includes a dedicated test suite runner for the Kody pipeline:

| File                             | Purpose                                              |
| -------------------------------- | ---------------------------------------------------- |
| `tests/helpers/login.ts`         | E2E authentication helper                            |
| `tests/helpers/seedUser.ts`      | User fixture setup/teardown                          |
| `tests/e2e/admin.e2e.spec.ts`    | Admin panel navigation (dashboard, list, edit views) |
| `tests/e2e/frontend.e2e.spec.ts` | Frontend homepage smoke test                         |

Kody workflow (`kody.yml`) triggers on: issue comments (`@kody`), PR reviews, workflow completion, push to `main/dev`, and scheduled cron (`*/30 * * * *`).
