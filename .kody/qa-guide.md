# QA Guide

## Quick Reference

- **Dev server:** `pnpm dev` at `http://localhost:3000`
- **Login page:** `/login`
- **Admin panel:** `/admin`

## Authentication

### Test Accounts

| Role       | Email                    | Password                    |
| ---------- | ------------------------ | --------------------------- |
| Admin      | `${QA_ADMIN_EMAIL}`      | `${QA_ADMIN_PASSWORD}`      |
| Engineer   | `${QA_ENGINEER_EMAIL}`   | `${QA_ENGINEER_PASSWORD}`   |
| CEO        | `${QA_CEO_EMAIL}`        | `${QA_CEO_PASSWORD}`        |
| CTO        | `${QA_CTO_EMAIL}`        | `${QA_CTO_PASSWORD}`        |
| Researcher | `${QA_RESEARCHER_EMAIL}` | `${QA_RESEARCHER_PASSWORD}` |

### Login Steps

1. Navigate to `/login`
2. Enter credentials from the test accounts table above (or env vars)
3. Submit the login form
4. Verify redirect to dashboard (`/dashboard`) or home page (`/`)

### Auth Files

- `src/auth/`
- `src/middleware/request-logger.ts`
- `src/middleware/rate-limiter.ts`

## Roles

- `admin`
- `Engineer`
- `CEO`
- `CTO`
- `Researcher`

## Navigation Map

### Admin Panel

#### `/admin/collections/assignments`

- **Name:** Assignments
- **Fields:** title, module, instructions, dueDate, maxScore, rubric, criterion, maxPoints, description

#### `/admin/collections/courses`

- **Name:** Courses
- **Fields:** title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label

#### `/admin/collections/enrollments`

- **Name:** Enrollments
- **Fields:** student, course, enrolledAt, status, completedAt, completedLessons

#### `/admin/collections/lessons`

- **Name:** Lessons
- **Fields:** title, course, module, order, type, content, videoUrl, estimatedMinutes

#### `/admin/collections/media`

- **Name:** Media
- **Fields:** alt

#### `/admin/collections/modules`

- **Name:** Modules
- **Fields:** title, course, order, description

#### `/admin/collections/notifications`

- **Name:** Notifications
- **Fields:** recipient, type, title, message, link, isRead

#### `/admin/collections/quiz-attempts`

- **Name:** QuizAttempts
- **Fields:** user, quiz, score, passed, answers, questionIndex, answer, startedAt, completedAt

#### `/admin/collections/quizzes`

- **Name:** Quizzes
- **Fields:** title, module, order, passingScore, timeLimit, maxAttempts, questions, text, type, options

#### `/admin/collections/submissions`

- **Name:** Submissions
- **Fields:** assignment, student, content, attachments, file, submittedAt, status, grade, feedback, rubricScores

#### `/admin/collections/users`

- **Name:** Users
- **Fields:** firstName, lastName, displayName, avatar, bio, role, organization, refreshToken, tokenExpiresAt, lastTokenUsedAt

#### `/admin/collections/certificates`

- **Name:** Certificates
- **Fields:** student, course, issuedAt, certificateNumber, finalGrade

#### `/admin/collections/notes`

- **Name:** Notes
- **Fields:** title, content, tags

### Frontend Pages

#### `/`

- Home page — verify hero/content loads

#### `/dashboard`

- User dashboard — verify enrolled courses, recent activity visible

#### `/instructor/courses/:id/edit`

- Course editor — verify title, slug, description fields; CourseLessonsSorter component if present

#### `/notes`

- Notes list — verify notes load with title, tags

#### `/notes/create`

- Create note form — verify title, content, tags fields

#### `/notes/:id`

- Note detail view — verify full content renders

#### `/notes/edit/:id`

- Edit note form — verify pre-filled fields, save button

## API Endpoints

| Path                         | Methods   | Purpose                           |
| ---------------------------- | --------- | --------------------------------- |
| `/api/notes`                 | GET, POST | Note CRUD with search             |
| `/api/quizzes/[id]`          | GET       | Quiz retrieval                    |
| `/api/quizzes/[id]/submit`   | POST      | Quiz grading                      |
| `/api/quizzes/[id]/attempts` | GET       | User's quiz attempts              |
| `/api/courses/search`        | GET       | Course search                     |
| `/api/enroll`                | POST      | Enrollment (viewer role required) |
| `/api/gradebook/course/[id]` | GET       | Grades per course (editor/admin)  |
| `/api/health`                | GET       | Health check                      |

## Component Verification Patterns

- **Payload CMS Admin:** Navigate to `/admin/collections/{slug}` — verify collection list loads with expected columns
- **Course Lessons Sorter:** Go to `/instructor/courses/:id/edit` — verify drag-sortable lessons grouped by module
- **Notes CRUD:** Navigate through `/notes`, `/notes/create`, `/notes/:id`, `/notes/edit/:id` — verify forms, content rendering, and save actions
- **Quiz Submission:** Go to quiz detail page — verify questions render, submit button grades answers

## Common Test Scenarios

1. **Login flow:** Navigate to `/login` → fill credentials → submit → verify redirect to `/dashboard`
2. **Admin CRUD:** Navigate to `/admin/collections/{slug}` → click "Create" → fill form → save → verify in list
3. **Course enrollment:** Login as Engineer → navigate to course → click enroll → verify enrollment in `/admin/collections/enrollments`
4. **Note creation:** Login → go to `/notes/create` → fill title/content/tags → save → verify at `/notes/:id`
5. **Quiz attempt:** Login → find quiz → start attempt → answer questions → submit → verify score displayed

## Environment Setup

Required env vars to start the dev server:

- `DATABASE_URL`
- `PAYLOAD_SECRET`

Optional for testing:

- `QA_ADMIN_EMAIL`, `QA_ADMIN_PASSWORD`, `QA_ENGINEER_EMAIL`, `QA_ENGINEER_PASSWORD`, `QA_CEO_EMAIL`, `QA_CEO_PASSWORD`, `QA_CTO_EMAIL`, `QA_CTO_PASSWORD`, `QA_RESEARCHER_EMAIL`, `QA_RESEARCHER_PASSWORD`

## Dev Server

```bash
pnpm dev
```

- **URL:** `http://localhost:3000`

## Rules

- Verify page loads without console errors before interacting
- Use real credentials from env vars or the test accounts table
- For admin collection tests, always verify the created item appears in the list view
- When testing CRUD, verify both the success state AND the error state
- Use `page.waitForURL()` after form submissions to confirm navigation
