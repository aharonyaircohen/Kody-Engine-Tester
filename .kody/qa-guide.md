# QA Guide

## Quick Reference

- Dev server: `pnpm dev` at `http://localhost:3000`
- Login page: `/login`
- Admin panel: `/admin` (Payload CMS 3.80.0)

## Authentication

### Test Accounts

Use environment variables — set these before running tests:

| Role  | Email env var  | Password env var  |
| ----- | -------------- | ----------------- |
| Admin | QA_ADMIN_EMAIL | QA_ADMIN_PASSWORD |
| User  | QA_USER_EMAIL  | QA_USER_PASSWORD  |

### Login Steps

1. Navigate to `/login`
2. Enter credentials (use env vars)
3. Submit form — verify redirect to `/dashboard`

### Auth Files

- `src/auth/withAuth.ts` — JWT validation HOC
- `src/auth/JwtService.ts` — Web Crypto JWT handling
- `src/middleware/validation.ts` — `createValidationMiddleware`

## Navigation Map

### Admin Panel (`/admin`)

| URL                                | What to Expect                                                     |
| ---------------------------------- | ------------------------------------------------------------------ |
| `/admin/collections/assignments`   | Assignments list — title, module, dueDate, maxScore columns        |
| `/admin/collections/courses`       | Courses list — title, slug, instructor, status, difficulty columns |
| `/admin/collections/enrollments`   | Enrollments — student, course, status, enrolledAt columns          |
| `/admin/collections/lessons`       | Lessons — title, course, module, order, type, estimatedMinutes     |
| `/admin/collections/media`         | Media uploads — thumbnail grid, alt text field                     |
| `/admin/collections/modules`       | Modules — title, course, order, description                        |
| `/admin/collections/notifications` | Notifications — recipient, type, title, isRead toggle              |
| `/admin/collections/quiz-attempts` | QuizAttempts — user, quiz, score, passed, startedAt                |
| `/admin/collections/quizzes`       | Quizzes — title, module, passingScore, timeLimit, maxAttempts      |
| `/admin/collections/submissions`   | Submissions — assignment, student, status, grade, feedback         |
| `/admin/collections/users`         | Users — firstName, lastName, role, organization, lastLogin         |
| `/admin/collections/certificates`  | Certificates — student, course, issuedAt, certificateNumber        |
| `/admin/collections/notes`         | Notes — title, tags                                                |

### Frontend Pages

| Path                           | Expected Content                                            | Key Interactions                |
| ------------------------------ | ----------------------------------------------------------- | ------------------------------- |
| `/`                            | Home/landing page                                           | Navigation, course cards        |
| `/dashboard`                   | User dashboard — enrolled courses, recent activity          | Sidebar nav, course links       |
| `/instructor/courses/:id/edit` | Course editor — title, slug, description, instructor select | Save, cancel, module sorter     |
| `/notes`                       | Notes list with search                                      | Create note, click note to view |
| `/notes/create`                | Note creation form                                          | Title, content, tags fields     |
| `/notes/:id`                   | Single note view                                            | Edit button, delete button      |
| `/notes/edit/:id`              | Note edit form                                              | Save, cancel                    |

### API Endpoints

| Path                         | Methods           | Purpose                                                  |
| ---------------------------- | ----------------- | -------------------------------------------------------- |
| `/api/notes`                 | GET, POST         | Note CRUD with search                                    |
| `/api/notes/[id]`            | GET, POST, DELETE | Single note operations                                   |
| `/api/quizzes/[id]`          | GET               | Quiz retrieval                                           |
| `/api/quizzes/[id]/submit`   | POST              | Quiz grading via QuizGrader                              |
| `/api/quizzes/[id]/attempts` | GET               | User's quiz attempts                                     |
| `/api/courses/search`        | GET               | Course search (sort: relevance/newest/popularity/rating) |
| `/api/enroll`                | POST              | Enrollment (viewer role required)                        |
| `/api/gradebook/course/[id]` | GET               | Grades per course (editor/admin)                         |

## Component Verification Patterns

### Admin Components

- **CourseLessonsSorter** — `/admin/collections/courses` edit view — verify drag-sortable lessons grouped by chapter
- **NotificationBell** — header area — click to open dropdown, verify isRead toggle works
- **QuizQuestionEditor** — `/admin/collections/quizzes` — verify question order, add/remove questions
- **SubmissionGrader** — `/admin/collections/submissions` — verify rubric scores, feedback textarea

### Frontend Components

- **CourseCard** — `/dashboard` — verify thumbnail, title, instructor, progress bar
- **NoteEditor** — `/notes/create` and `/notes/edit/:id` — verify autosave, tag input
- **LessonPlayer** — lesson pages — verify video/content renders, estimatedMinutes shown

## Common Test Scenarios

### Admin CRUD Flow

1. Navigate to `/admin/collections/notes`
2. Click "Create Note" — fill title, content, tags — Save
3. Verify note appears in list
4. Click edit — modify — Save
5. Verify changes persist

### Enrollment Flow

1. Login as admin
2. Navigate to `/admin/collections/enrollments`
3. Create enrollment — select student, course, status
4. Verify enrollment appears in student dashboard

### Quiz Submission Flow

1. Login as student
2. Navigate to course lesson with quiz
3. Start quiz — answer questions — Submit
4. Verify score and passed/failed status

## Environment Setup

Required env vars before `pnpm dev`:

- `DATABASE_URL` — PostgreSQL connection string
- `PAYLOAD_SECRET` — JWT signing secret

Optional for tests:

- `QA_ADMIN_EMAIL` / `QA_ADMIN_PASSWORD`
- `QA_USER_EMAIL` / `QA_USER_PASSWORD`

## Dev Server

```bash
pnpm dev
# Runs at http://localhost:3000
```

## Rules

- All credentials via env vars — never hardcode
- Playwright: use `page.goto('/login')` for auth flows
- Visual assertions: "verify X is visible" not just "check X exists"
- Admin tests: wait for Payload to fully load before interacting
- Run `pnpm test:e2e` after UI changes for regression coverage
