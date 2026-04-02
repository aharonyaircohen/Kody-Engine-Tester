# Add E2E test: verify course creation form renders with all expected fields

## Description

Add a Playwright E2E test that verifies the course creation form in the Payload CMS admin panel renders correctly with all expected fields.

## Requirements

1. Create a new E2E test file `tests/e2e/course-form.spec.ts`
2. The test should:
   - Navigate to the admin panel at `/admin/collections/courses/create`
   - Verify the page loads successfully
   - Assert the following form fields are present: title, slug, description
   - Take a screenshot of the rendered form for visual confirmation
3. Use the existing Playwright configuration (`playwright.config.ts`)
4. Run `npx playwright test tests/e2e/course-form.spec.ts` to verify it passes

## Acceptance Criteria

- [ ] New test file exists at `tests/e2e/course-form.spec.ts`
- [ ] Test navigates to course creation page
- [ ] Test asserts form fields are visible
- [ ] Test passes when run with `npx playwright test`

## Labels

kody:low