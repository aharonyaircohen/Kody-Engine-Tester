# Write E2E tests by exploring the UI with Playwright

## Task

Use Playwright to explore the application UI and write meaningful E2E tests based on what you actually see on screen.

## Requirements

1. **Start the dev server** and navigate to the app at `http://localhost:3000`
2. **Take screenshots** and inspect the actual rendered pages — do NOT guess the UI from source code alone
3. **Explore key pages**: homepage, admin panel, collection views, forms
4. **Write new Playwright E2E tests** in `tests/e2e/` covering at least 2 user flows you discover by exploring
5. Each test must interact with real UI elements you observed (click buttons, fill forms, verify visible text)
6. Tests must pass when run with `pnpm test:e2e`

## Constraints

- You MUST use the Playwright browser tools (navigate, snapshot, click, fill, screenshot) to understand the UI before writing tests
- Do NOT just read source code and guess what the UI looks like — actually browse the app
- Use the existing test helpers in `tests/helpers/` (login, seedUser) where appropriate
- Follow existing test patterns in `tests/e2e/`

## Success Criteria

- New E2E test file(s) added to `tests/e2e/`
- Tests exercise real UI interactions discovered through Playwright exploration
- All tests pass