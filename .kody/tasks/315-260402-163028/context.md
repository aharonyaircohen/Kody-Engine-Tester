
### taskify (2026-04-02T13:31:25)
Created `tests/e2e/admin-dashboard.spec.ts` with three tests:

1. **Dashboard loads** — navigates to `/admin`, asserts the Dashboard heading is visible, and takes a screenshot
2. **Courses nav link** — asserts the courses collection link is visible in the sidebar
3. **Users nav link** — asserts the users collection link is visible in the sidebar

The test follows the same pattern as `admin.e2e.spec.ts`: `beforeAll` seeds a test user and logs in, `afterAll` cleans up.


### build (2026-04-02T13:31:45)
The test file at `tests/e2e/admin-dashboard.spec.ts` is already complete from the previous stage. It implements all three requirements:

1. Navigates to `/admin` and verifies the URL
2. Checks for the `span[title="Dashboard"]` heading element
3. Asserts `a[href*="/admin/collections/courses"]` and `a[href*="/admin/collections/users"]` are visible

The test follows the same pattern as `admin.e2e.spec.ts` (beforeAll/afterAll with seedTestUser/cleanupTestUser and login). The screenshots directory do
...(truncated)
