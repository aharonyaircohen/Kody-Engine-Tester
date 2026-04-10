# QA Guide

## Quick Reference

- **Dev server:** `pnpm dev` at `http://localhost:3000`
- **Login page:** `/login`
- **Admin panel:** `/admin` (Payload CMS 3.80.0)

## Authentication

### Test Accounts

| Role  | Email             | Password  |
| ----- | ----------------- | --------- |
| Admin | admin@example.com | CHANGE_ME |
| User  | user@example.com  | CHANGE_ME |

> Use env vars `QA_ADMIN_EMAIL`, `QA_ADMIN_PASSWORD` for CI/test environments.

### Login Steps

1. Navigate to `/login`
2. Enter credentials from the test accounts table above
3. Submit the login form
4. Verify redirect to dashboard or home page

### Auth Files

- `src/auth/` — JWT service, auth service, session store, user store, role guards

## Roles

- `admin`
- `Engineer`
- `CEO`
- `CTO`
- `Researcher`

## Navigation Map

### Admin Panel — Collections

#### `/admin/collections/assignments`

- **Fields:** title, module, instructions, dueDate, maxScore, rubric, criterion, maxPoints, description

#### `/admin/collections/certificates`

- **Fields:** student, course, issuedAt, certificateNumber, finalGrade

#### `/admin/collections/courses`

- **Fields:** title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label, maxEnrollments, quizWeight, assignmentWeight

#### `/admin/collections/enrollments`

- **Fields:** student, course, enrolledAt, status, completedAt, completedLessons

#### `/admin/collections/lessons`

- **Fields:** title, course, module, order, type, content, videoUrl, estimatedMinutes

#### `/admin/collections/media`

- **Fields:** alt

#### `/admin/collections/modules`

- **Fields:** title, course, order, description

#### `/admin/collections/notes`

- **Fields:** title, content, tags

#### `/admin/collections/notifications`

- **Fields:** recipient, type, title, message, link, isRead

#### `/admin/collections/quiz-attempts`

- **Fields:** user, quiz, score, passed, answers, questionIndex, answer, startedAt, completedAt

#### `/admin/collections/quizzes`

- **Fields:** title, module, order, passingScore, timeLimit, maxAttempts, questions, text, type, options, isCorrect, correctAnswer, points

#### `/admin/collections/submissions`

- **Fields:** assignment, student, content, attachments, file, submittedAt, status, grade, feedback, rubricScores, criterion, score, comment

#### `/admin/collections/users`

- **Fields:** firstName, lastName, displayName, avatar, bio, role, organization, refreshToken, tokenExpiresAt, lastTokenUsedAt

### Frontend Pages

| Path                           | Expected Content   | Key Interactions                            |
| ------------------------------ | ------------------ | ------------------------------------------- |
| `/`                            | Home page          | —                                           |
| `/dashboard`                   | User dashboard     | —                                           |
| `/instructor/courses/:id/edit` | Course editor      | Edit course details, manage lessons/modules |
| `/notes`                       | Notes list         | Create/edit/delete notes                    |
| `/notes/:id`                   | Single note view   | —                                           |
| `/notes/create`                | Note creation form | Fill title, content, tags                   |
| `/notes/edit/:id`              | Note edit form     | Modify and save note                        |

### API Endpoints

| Path                        | Methods   | Purpose                                |
| --------------------------- | --------- | -------------------------------------- |
| `/api/notes`                | GET, POST | Note CRUD with search                  |
| `/api/notes/:id`            | GET, POST | Single note retrieval/update           |
| `/api/quizzes/:id`          | GET       | Quiz retrieval                         |
| `/api/quizzes/:id/submit`   | POST      | Quiz grading via QuizGrader            |
| `/api/quizzes/:id/attempts` | GET       | User's quiz attempts                   |
| `/api/courses/search`       | GET       | Course search with CourseSearchService |
| `/api/enroll`               | POST      | Enrollment (viewer role required)      |
| `/api/gradebook/course/:id` | GET       | Grades per course (editor/admin)       |
| `/api/notifications`        | GET       | User notifications                     |
| `/api/health`               | GET       | Health check                           |
| `/api/csrf-token`           | GET       | CSRF token                             |

## Component Verification Patterns

### Admin Collection List Pages

Navigate to `/admin/collections/<slug>` — verify table renders with expected columns, pagination controls visible.

### Admin Edit/Create Forms

Navigate to `/admin/collections/<slug>` and click "Create New" or an edit button — verify form fields match collection fields listed above.

### Drag-Sortable Components (CourseLessonsSorter)

Navigate to `/instructor/courses/:id/edit` — verify lessons appear grouped by module, drag handles visible, reorder persists after drop.

### Notes CRUD

Navigate to `/notes/create` — fill title, content, tags fields, submit, verify redirect to `/notes/:id`. Edit via `/notes/edit/:id`.

## Common Test Scenarios

1. **Admin Login Flow:** Navigate to `/login`, submit admin credentials, verify redirect to `/admin`.
2. **Create Note:** Login → `/notes/create` → fill form → submit → verify note appears at `/notes`.
3. **Course Enrollment:** Login as student → `/api/enroll` → verify enrollment appears in `/admin/collections/enrollments`.
4. **Quiz Submission:** Login → navigate to quiz → submit answers → verify score and pass/fail status.
5. **Role Access:** Login as each role → verify admin routes at `/admin/*` accessible only for admin role.

## Environment Setup

Required env vars:

- `DATABASE_URL` — PostgreSQL connection string
- `PAYLOAD_SECRET` — Secret for Payload CMS

## Dev Server

- **Command:** `pnpm dev`
- **URL:** `http://localhost:3000`

## Rules

- Use Playwright `page.goto()` with full URL: `http://localhost:3000<path>`
- For admin routes, ensure user is authenticated before navigating
- Verify elements are visible with `expect(page.locator('...')).toBeVisible()`
- Use `page.fill()` for text inputs, `page.click()` for buttons
- For drag-sortable tests, use `page.dragAndDrop()`
