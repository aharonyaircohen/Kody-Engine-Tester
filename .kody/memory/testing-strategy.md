## Coverage

- No explicit threshold configured; vitest run passes `--coverage` implicitly
- Example coverage: `CourseSearchService` tested via mocked Payload find calls

## Configuration Details

- **Vitest setup**: `vitest.setup.ts` loaded before tests; environment `jsdom`
- **Vitest include**: `src/**/*.test.ts`, `src/**/*.test.tsx`, `tests/int/**/*.int.spec.ts`
- **Playwright projects**: Chromium only (`channel: 'chromium'`); HTML reporter; `webServer` starts `pnpm dev`

## Additional CI Gates

- `test-ci.yml` runs health check echo and `exit 1` on PR events (placeholder)
- `kody.yml` triggers on `push` to `src/**`, `kody.config.json`, `package.json` changes; concurrent group prevents parallel runs
- Playwright `forbidOnly: !!process.env.CI` blocks `.only()` in CI

## Test Data

- E2E: `tests/helpers/seedUser.ts` creates `testUser` fixture; `login()` helper authenticates via UI
- Integration: `vi.useFakeTimers()` / `vi.useRealTimers()` for async RetryQueue tests

## Example References

- Unit: `src/utils/url-parser.test.ts`, `src/utils/retry-queue.test.ts`
- E2E: `tests/e2e/admin.e2e.spec.ts`, `tests/e2e/frontend.e2e.spec.ts`
