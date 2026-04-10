# QA Guide

## Quick Reference

- **Dev server:** `pnpm dev` at `http://localhost:3000`
- **Login page:** `/login`
- **Admin panel:** `/admin` (Payload CMS 3.80.0)

## Authentication

### Test Accounts

Use environment variables for credentials:

| Role  | Email env var    | Password env var    |
| ----- | ---------------- | ------------------- |
| Admin | `QA_ADMIN_EMAIL` | `QA_ADMIN_PASSWORD` |
| User  | `QA_USER_EMAIL`  | `QA_USER_PASSWORD`  |

### Login Steps

1. Navigate to `/login`
2. Enter credentials (email + password)
3. Submit form — verify redirect to `/dashboard`
4. For admin access, use admin role account

### Auth Files

- `src/auth/` — JWT service, session store, user store
- `src/middleware/auth.ts` — withAuth HOC
- `src/middleware/csrf.ts` — CSRF protection

## Roles

`admin`, `Engineer`, `CEO`, `CTO`, `Researcher`

## Navigation Map

### Admin Panel

| Collection    | URL                                | Key Fields                                                          |
| ------------- | ---------------------------------- | ------------------------------------------------------------------- |
| Assignments   | `/admin/collections/assignments`   | title, module, instructions, dueDate, maxScore, rubric              |
| Courses       | `/admin/collections/courses`       | title, slug, description, thumbnail, instructor, status, difficulty |
| Enrollments   | `/admin/collections/enrollments`   | student, course, enrolledAt, status, completedLessons               |
| Lessons       | `/admin/collections/lessons`       | title, course, module, order, type, content, videoUrl               |
| Media         | `/admin/collections/media`         | alt                                                                 |
| Modules       | `/admin/collections/modules`       | title, course, order, description                                   |
| Notes         | `/admin/collections/notes`         | title, content, tags                                                |
| Notifications | `/admin/collections/notifications` | recipient, type, title, message, isRead                             |
| Quiz Attempts | `/admin/collections/quiz-attempts` | user, quiz, score, passed, answers                                  |
| Quizzes       | `/admin/collections/quizzes`       | title, module, order, passingScore, timeLimit, questions            |
| Submissions   | `/admin/collections/submissions`   | assignment, student, status, grade, feedback                        |
| Users         | `/admin/collections/users`         | firstName, lastName, displayName, role, organization                |
| Certificates  | `/admin/collections/certificates`  | student, course, issuedAt, certificateNumber                        |

### Frontend Pages

| Route                          | Expected Content  | Key Interactions                     |
| ------------------------------ | ----------------- | ------------------------------------ |
| `/`                            | Home/landing page | Navigation links                     |
| `/dashboard`                   | Dashboard view    | Role-specific content                |
| `/instructor/courses/:id/edit` | Course editor     | Edit course details, reorder modules |
| `/notes`                       | Notes list        | Create, edit, delete notes           |
| `/notes/:id`                   | Note detail view  | View note content                    |
| `/notes/create`                | Create note form  | Fill title, content, tags            |
| `/notes/edit/:id`              | Edit note form    | Modify existing note                 |

### API Endpoints

| Endpoint                     | Methods   | Purpose                  |
| ---------------------------- | --------- | ------------------------ |
| `/api/notes`                 | GET, POST | Note CRUD with search    |
| `/api/quizzes/[id]`          | GET       | Quiz retrieval           |
| `/api/quizzes/[id]/submit`   | POST      | Quiz grading             |
| `/api/courses/search`        | GET       | Course search            |
| `/api/enroll`                | POST      | Enrollment (viewer role) |
| `/api/gradebook/course/[id]` | GET       | Grades per course        |

## Component Verification Patterns

### Admin Components (Payload CMS)

- **Collection list view:** Table with rows, click row to edit
- **Edit form:** Sidebar with fields, Save/Delete buttons
- **Field types:** Text input, textarea, relationship (dropdown), datetime, number

### Frontend Components

- **CourseLessonsSorter:** Drag-sortable lessons grouped by module (instructor course edit)
- **NoteEditor:** Title, content (rich text), tags input
- **Dashboard cards:** Stats, recent activity

## Common Test Scenarios

### CRUD: Notes

1. Create: Navigate `/notes/create`, fill form, submit, verify redirect to `/notes/:id`
2. Read: Navigate `/notes`, verify note appears in list
3. Update: Navigate `/notes/edit/:id`, modify, save, verify changes
4. Delete: From edit page, click Delete, confirm, verify redirect to `/notes`

### Auth Flow

1. Navigate to `/login` with no session → should show login form
2. Fill invalid credentials → should show error
3. Fill valid credentials → should redirect to `/dashboard`
4. Access `/admin` without auth → should redirect to login

### Admin: Course Creation

1. Go to `/admin/collections/courses`
2. Click "Create" button
3. Fill required fields (title, slug)
4. Add modules via relationship field
5. Save → verify redirect to list with new course

## Environment Setup

Required env vars before running `pnpm dev`:

- `DATABASE_URL` — PostgreSQL connection string
- `PAYLOAD_SECRET` — Secret for Payload CMS

## Dev Server

```bash
pnpm dev
# Runs at http://localhost:3000
```

## Rules

- Be specific to this project — use actual collection names, URLs, field names
- For admin, always use `/admin/collections/{slug}` paths
- Visual assertions: "verify X is visible on page"
- Interaction tests: "click button X", "fill field Y"
- Keep under 200 lines
- Use env vars for credentials, never hardcode
