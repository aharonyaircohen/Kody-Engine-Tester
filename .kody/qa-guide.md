# QA Guide

## Quick Reference

- **Dev server**: `pnpm dev` → `http://localhost:3000`
- **Login page**: `http://localhost:3000/admin`
- **Admin panel**: `http://localhost:3000/admin`

## Authentication

### Test Accounts

| Role       | Email                  | Password                  |
| ---------- | ---------------------- | ------------------------- |
| admin      | `$QA_ADMIN_EMAIL`      | `$QA_ADMIN_PASSWORD`      |
| instructor | `$QA_INSTRUCTOR_EMAIL` | `$QA_INSTRUCTOR_PASSWORD` |
| student    | `$QA_STUDENT_EMAIL`    | `$QA_STUDENT_PASSWORD`    |

Default dev credentials: `dev@payloadcms.com` / `test`

### Login Steps

1. Navigate to `http://localhost:3000/admin`
2. Fill `input[name="email"]` with email
3. Fill `input[name="password"]` with password
4. Click `button[type="submit"]`
5. Verify redirect to `/admin` dashboard — you should see the Payload CMS nav sidebar

### Auth Files

- `src/auth/` — user store, session logic
- `src/middleware/` — rate limiting, role guard
- `src/collections/Users.ts` — role field, JWT fields
- `tests/e2e/helpers/login.ts` — shared login helper
- `tests/e2e/helpers/seedUser.ts` — seed test users

## Navigation Map

### Admin Panel

- `/admin` — Dashboard. Verify sidebar nav links for all collections.
- `/admin/collections/users` — Users list. Verify firstName, lastName, role columns visible.
- `/admin/collections/courses` — Courses list. Verify title, status, difficulty columns.
- `/admin/collections/courses/create` — Course create form. Fields: title, slug, description, thumbnail, instructor, status (draft/published), difficulty, estimatedHours, tags.
- `/admin/collections/lessons` — Lessons list. Verify title, type, order columns.
- `/admin/collections/enrollments` — Enrollments list. Verify student, course, status, enrolledAt.
- `/admin/collections/quizzes` — Quizzes list. Verify title, passingScore columns.
- `/admin/collections/quiz-attempts` — Quiz Attempts list. Verify user, score, passed columns.
- `/admin/collections/assignments` — Assignments list. Verify title, dueDate, maxScore.
- `/admin/collections/submissions` — Submissions list. Verify assignment, student, status, grade.
- `/admin/collections/certificates` — Certificates list. Verify student, course, issuedAt, certificateNumber.
- `/admin/collections/notifications` — Notifications list. Verify recipient, type, isRead columns.
- `/admin/collections/notes` — Notes list. Verify title, tags columns.
- `/admin/collections/media` — Media library. Verify image grid with alt text visible.

### Frontend Pages

- `/` — Home page. Verify page loads without errors.
- `/dashboard` — Authenticated dashboard. Requires login; verify user-specific content visible.
- `/notes` — Notes list. Verify list of notes renders; "Create Note" button present.
- `/notes/create` — Note creation form. Fill title, content, tags fields; submit.
- `/notes/:id` — Note detail view. Verify title and content rendered.
- `/notes/edit/:id` — Note edit form. Verify fields pre-populated with existing data.
- `/instructor/courses/:id/edit` — Course edit form (instructor only). Verify title, description fields; restricted to instructor/admin role.

### API Endpoints

- `POST /api/users/login` — Auth login, returns JWT
- `POST /api/users/logout` — Auth logout
- `GET /api/[collection]` — REST list endpoint (access-controlled)
- `POST /api/[collection]` — REST create endpoint
- `PATCH /api/[collection]/:id` — REST update endpoint
- `DELETE /api/[collection]/:id` — REST delete endpoint

## Component Verification Patterns

### Rich Text (Lexical Editor)

- Present on: Lessons (`content`), Notes (`content`), Assignments (`instructions`)
- Navigate to `/admin/collections/lessons/create`
- Verify `.rich-text-lexical` editor renders
- Click into editor, type text, verify toolbar appears (bold, italic, headings)

### Relationship Fields

- Present on: Enrollments (student→users, course→courses), Lessons (course, module)
- On create form, click relationship field → verify dropdown/search modal opens
- Type to search, verify filtered results appear, select an item

### Array/Block Fields (Rubric, Questions, Options)

- Present on: Assignments (`rubric` array), Quizzes (`questions` array)
- Navigate to `/admin/collections/assignments/create`
- Click "Add Rubric Item" → verify new row appears with criterion, maxPoints, description fields
- Click remove icon → verify row disappears

## Common Test Scenarios

### Course CRUD

1. Login as admin
2. Navigate to `/admin/collections/courses/create`
3. Fill: title="Test Course", slug="test-course", status="draft"
4. Click Save — verify redirect to edit page, success toast visible
5. Navigate to `/admin/collections/courses` — verify "Test Course" appears in list
6. Open record, change status to "published", Save
7. Delete record — verify removed from list

### Auth Redirect

1. Log out (navigate to `/admin/logout` or clear cookies)
2. Navigate to `/admin/collections/courses` — verify redirect to `/admin/login`
3. Navigate to `/dashboard` — verify redirect to login

### Notes CRUD (Frontend)

1. Login, navigate to `/notes/create`
2. Fill title and content, submit
3. Verify redirect to `/notes/:id` showing new note
4. Navigate to `/notes` — verify note appears in list
5. Click edit — verify `/notes/edit/:id` loads with pre-filled fields

### Role Access Control

1. Login as student
2. Navigate to `/instructor/courses/[any-id]/edit` — verify 403 or redirect
3. Navigate to `/admin` — verify access denied or limited sidebar

## Environment Setup

| Variable         | Purpose                           |
| ---------------- | --------------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string      |
| `PAYLOAD_SECRET` | JWT signing secret (min 32 chars) |

## Dev Server

```bash
pnpm dev
# → http://localhost:3000
```
