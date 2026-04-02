
### taskify (2026-04-02T07:47:42)
The routes exist. Here's a summary of what I wrote:

---

**`tests/e2e/course-editor.e2e.spec.ts`** — 8 tests covering the instructor course editor UI (`/instructor/courses/:id/edit`):
- Heading and "Add Module" button render correctly
- Back link points to the course overview
- Publish toggle shows "Draft" badge initially
- Clicking "Publish" opens a confirmation dialog with correct text
- Cancelling the dialog keeps status as "Draft"
- Confirming publish changes badge to "Published" and button
...(truncated)

### build (2026-04-02T07:54:21)
Everything looks good. Here's a summary of what was done and why:

## Changes made

**`src/collections/Users.ts`** — Added `'student'` to the role options array. The dashboard page guards access with `role !== 'student'`, but this role was missing from the collection's valid options.

**`src/payload-types.ts`** — Updated the `User.role` type union to include `'student'`, keeping the generated types in sync with the collection definition.

**`tests/helpers/seedUser.ts`** — Added required `firstNa
...(truncated)
