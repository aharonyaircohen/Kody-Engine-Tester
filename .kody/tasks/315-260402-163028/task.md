# Add E2E test: verify admin dashboard loads with correct navigation

## Description

Add a Playwright E2E test that verifies the Payload CMS admin dashboard loads correctly and displays navigation links.

## Requirements

1. Create a new E2E test file `tests/e2e/admin-dashboard.spec.ts`
2. The test should:
   - Navigate to `/admin`
   - Verify the page loads (check for admin panel heading or navigation)
   - Assert that collection navigation links are visible (e.g., courses, users)
3. Use the existing Playwright configuration
4. Run `npx playwright test tests/e2e/admin-dashboard.spec.ts` to verify

## Labels

kody:low