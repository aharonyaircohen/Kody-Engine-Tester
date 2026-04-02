
### taskify (2026-04-02T13:15:56)
Created `tests/e2e/course-form.spec.ts` following the existing `admin.e2e.spec.ts` patterns:

- Seeds/cleans a test user via `beforeAll`/`afterAll`
- Logs in before navigating to the course creation URL
- Asserts `title`, `slug`, and `description` fields are visible
- Takes a screenshot saved to `tests/e2e/screenshots/course-form.png`

Also created the `tests/e2e/screenshots/` directory so the screenshot step doesn't fail.


### build (2026-04-02T13:16:42)
Everything is in order:

- `testDir: './tests/e2e'` — picks up all `.spec.ts` files in that directory, including `course-form.spec.ts`
- `tests/e2e/screenshots/` directory exists for the screenshot output
- The test file follows the exact same patterns as `admin.e2e.spec.ts`

The build stage is complete. The test file `tests/e2e/course-form.spec.ts` was created during taskify and correctly:
1. Seeds/cleans a test user via `beforeAll`/`afterAll`
2. Logs in before navigating to `/admin/collections
...(truncated)
