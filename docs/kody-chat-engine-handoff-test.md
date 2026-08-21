# Kody Chat-to-Engine handoff test

A harmless smoke-test note used by the Chat-to-Engine handoff. The three test
commands below are grounded in the current `package.json` scripts and the
`vitest.config.mts` / `playwright.config.ts` configs.

- **`pnpm test:int`** — runs `vitest run --config ./vitest.config.mts` under a `jsdom` environment with `vitest.setup.ts` loaded. It picks up unit and integration specs matching `src/**/*.test.ts`, `src/**/*.test.tsx`, `tests/**/*.test.ts`, and `tests/int/**/*.int.spec.ts`.
- **`pnpm test:e2e`** — runs `playwright test --config=playwright.config.ts` against `testDir: ./tests/e2e`, single chromium project, HTML reporter, and auto-starts `pnpm dev` on `http://localhost:3000` as its webServer.
- **`pnpm test`** — runs the full suite in sequence via `pnpm run test:int && pnpm run test:e2e`, so it executes the Vitest integration run followed by the Playwright end-to-end run.
