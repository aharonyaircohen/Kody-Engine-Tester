# Add E2E test: verify admin login redirects unauthenticated users

## Description

Add a new Playwright E2E test that verifies unauthenticated users are redirected to the login page when trying to access admin routes.

## Requirements

- Add a new test in `tests/e2e/auth.e2e.spec.ts`
- Test should navigate to `/admin` without authentication
- Verify it redirects to `/admin/login`
- Verify the login form is visible (email and password fields)
- Use existing Playwright config and patterns from `tests/e2e/admin.e2e.spec.ts`

## Acceptance Criteria

- [ ] New E2E test file `tests/e2e/auth.e2e.spec.ts` exists
- [ ] Test passes with `pnpm test:e2e`
- [ ] Follows existing test patterns in the repo