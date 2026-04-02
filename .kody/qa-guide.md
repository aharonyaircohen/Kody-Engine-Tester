# QA Guide

## Quick Reference

- **Dev server**: `pnpm dev` → http://localhost:3000
- **Login page**: http://localhost:3000/admin/login
- **Admin panel**: http://localhost:3000/admin

## Authentication

### Test Accounts

| Role           | Email                  | Password                  |
| -------------- | ---------------------- | ------------------------- |
| Admin (seeded) | `dev@payloadcms.com`   | `test`                    |
| Admin          | `$QA_ADMIN_EMAIL`      | `$QA_ADMIN_PASSWORD`      |
| Instructor     | `$QA_INSTRUCTOR_EMAIL` | `$QA_INSTRUCTOR_PASSWORD` |
| Student        | `$QA_STUDENT_EMAIL`    | `$QA_STUDENT_PASSWORD`    |

### Login Steps

1. Navigate to http://localhost:3000/admin/login
2. Fill `#field-email` with email
3. Fill `#field-password` with password
4. Click `button[type="submit"]`
5. Wait for redirect to `/admin`
6. Verify `span[title="Dashboard"]` is visible

### Auth Files

- `tests/helpers/login.ts` — reusable Playwright login helper
- `tests/helpers/seedUser.ts` — seeds/cleans `dev@payloadcms.com` test user
- `src/middleware/` — role guard middleware
- `src/auth/` — auth types and user store
- `src/app/(frontend)/dashboard/page.tsx` — redirects unauthenticated users to `/admin/login`

## Navigation Map

### Admin Panel

- `/admin` — Dashboard. Verify `span[title="Dashboard"]` is visible in sidebar.
- `/admin/collections/users` — Users list. Verify `h1` with text "Users" is visible. Table shows firstName, lastName, email, role columns.
- `/admin/collections/users/create` — Create user form. Verify `input[name="email"]` is visible. Fields: email, password, firstName, lastName, role, organization.
- `/admin/collections/courses` — Courses list. Fields: title, slug, status, difficulty, instructor.
- `/admin/collections/courses/create` — Course form. Fields: title, slug, description, thumbnail, instructor, status (draft/published), difficulty, estimatedHours, tags.
- `/admin/collections/lessons` — Lessons list. Fields: title, course, module, order, type, estimatedMinutes.
- `/admin/collections/enrollments` — Enrollments list. Fields: student, course, enrolledAt, status, completedAt.
- `/admin/collections/assignments` — Assignments list. Fields: title, module, instructions, dueDate, maxScore.
- `/admin/collections/quizzes` — Quizzes list. Fields: title, module, passingScore, timeLimit, maxAttempts, questions array.
- `/admin/collections/quiz-attempts` — Quiz attempts list. Fields: user, quiz, score, passed, startedAt, completedAt.
- `/admin/collections/submissions` — Submissions list. Fields: assignment, student, content, status, grade, feedback.
- `/admin/collections/certificates` — Certificates list. Fields: student, course, issuedAt, certificateNumber, finalGrade.
- `/admin/collections/notifications` — Notifications list. Fields: recipient, type, title, message, isRead.
- `/admin/collections/notes` — Notes list. Fields: title, content, tags.
- `/admin/collections/media` — Media list. Fields: alt, filename.

### Frontend Pages

- `/` — Homepage. Verify `h1` with text "Welcome to your new project." and page title matches `/Payload Blank Template/`.
- `/dashboard` — Student dashboard (requires auth + student role). Verify `h1` "My Dashboard" is visible. Shows `CourseProgressCard` grid, `UpcomingDeadlines`, `RecentActivity` panels. Unenrolled state shows "You are not enrolled in any courses yet."
- `/notes` — Notes list. Verify `h1` "Notes" is visible, "New Note" link is present. SearchBar input visible. Empty state shows "No notes yet. Create your first note!"
- `/notes/create` — Note creation form. Verify title and content inputs are present, save button is visible.
- `/notes/:id` — Note detail view. Verify note title is rendered.
- `/notes/edit/:id` — Note edit form. Verify fields are pre-filled with existing note data.
- `/instructor/courses/:id/edit` — Course editor (instructor only). Verify `h1` "Edit Course Content" is visible. `CoursePublishToggle` button visible in header. `ModuleList` renders below. Autosave indicator (`data-testid="autosave-indicator"`) appears after changes.

### API Endpoints

- `GET/POST /api/notes` — List / create notes
- `GET/PUT/DELETE /api/notes/:id` — Single note operations
- `GET /api/courses/search` — Course search
- `GET /api/dashboard/admin-stats` — Admin dashboard statistics
- `POST /api/enroll` — Enroll student in course
- `GET /api/gradebook` — Gradebook list
- `GET /api/gradebook/course/:id` — Per-course gradebook
- `GET /api/notifications` — List notifications
- `PATCH /api/notifications/:id/read` — Mark notification read
- `PATCH /api/notifications/read-all` — Mark all notifications read
- `GET /api/quizzes/:id` — Quiz detail
- `GET /api/quizzes/:id/attempts` — Quiz attempt history
- `POST /api/quizzes/:id/submit` — Submit quiz attempt
- `GET /api/csrf-token` — CSRF token
- `GET|POST /api/[...slug]` — Payload REST passthrough
- `POST /api/graphql` — GraphQL endpoint

## Component Verification Patterns

### CoursePublishToggle (`/instructor/courses/:id/edit`)

1. Navigate to `/instructor/courses/[valid-id]/edit`
2. Verify toggle button is visible in top-right header area
3. Click toggle — verify status changes between "draft" and "published"
4. Verify `data-testid="autosave-indicator"` shows "Saving…" then transitions to "Saved" within ~3s

### ModuleList with drag-reorder (`/instructor/courses/:id/edit`)

1. Navigate to `/instructor/courses/[valid-id]/edit`
2. Verify module list renders with at least one module card
3. Click "Add Module" — verify new module "New Module" appears in list
4. Edit module title inline — verify autosave indicator triggers
5. Click "Add Lesson" within a module — verify new lesson "New Lesson" appears
6. Delete a lesson — verify it is removed from the list
7. Delete a module — verify it and its lessons are removed

### Notes SearchBar (`/notes`)

1. Navigate to `/notes`
2. Type in the SearchBar — verify 300ms debounce before results filter
3. Enter a query matching no notes — verify "No notes match your search." message
4. Clear the search — verify all notes return

### CourseProgressCard + Dashboard (`/dashboard`)

1. Log in as a student with active enrollments
2. Navigate to `/dashboard`
3. Verify `CourseProgressCard` cards render with course title and progress percentage
4. Verify `UpcomingDeadlines` panel is visible
5. Verify `RecentActivity` panel is visible with quiz/submission entries

## Common Test Scenarios

### Admin CRUD: Course

1. Go to `/admin/collections/courses/create`
2. Fill title, slug, select status "draft", choose difficulty
3. Save — verify redirect to edit URL and success toast
4. Navigate to `/admin/collections/courses` — verify new course appears in list
5. Open the record, change status to "published", save — verify change persists

### Admin CRUD: User

1. Go to `/admin/collections/users/create`
2. Fill email, password, firstName, lastName, set role to "student"
3. Save — verify `input[name="email"]` shows the entered value after redirect
4. Go to users list — verify user appears

### Auth redirect: unauthenticated dashboard

1. Open a fresh browser context (no auth cookies)
2. Navigate to `/dashboard`
3. Verify redirect to `/admin/login`

### Notes CRUD flow

1. Go to `/notes/create`, fill title + content, save
2. Verify redirect to `/notes/:id` showing the note
3. Go to `/notes/edit/:id`, change title, save
4. Go to `/notes` — verify updated title in NoteCard grid
5. Delete note — verify it disappears from the list

### Quiz submission flow

1. Log in as student
2. `POST /api/quizzes/:id/submit` with answer payload
3. Verify response contains `score` and `passed` fields
4. Navigate to `/dashboard` — verify new quiz attempt appears in RecentActivity

## Environment Setup

| Variable         | Purpose                            |
| ---------------- | ---------------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string       |
| `PAYLOAD_SECRET` | JWT signing secret for Payload CMS |

## Dev Server

```bash
pnpm dev
# → http://localhost:3000
```
