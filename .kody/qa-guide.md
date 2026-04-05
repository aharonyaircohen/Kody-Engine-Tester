# QA Guide

## Quick Reference

- Dev server: `pnpm dev` at http://localhost:3000
- Login page: `/login`
- Admin panel: `/admin/:...segments?`

## Authentication

### Test Accounts

| Role       | Email                  | Password                  |
| ---------- | ---------------------- | ------------------------- |
| Admin      | ${QA_ADMIN_EMAIL}      | ${QA_ADMIN_PASSWORD}      |
| Engineer   | ${QA_ENGINEER_EMAIL}   | ${QA_ENGINEER_PASSWORD}   |
| CEO        | ${QA_CEO_EMAIL}        | ${QA_CEO_PASSWORD}        |
| CTO        | ${QA_CTO_EMAIL}        | ${QA_CTO_PASSWORD}        |
| Researcher | ${QA_RESEARCHER_EMAIL} | ${QA_RESEARCHER_PASSWORD} |

### Login Steps

1. Navigate to `/login`
2. Enter credentials from the test accounts table above
3. Submit the login form
4. Verify redirect to dashboard or home page

### Auth Files

- `src/auth`

## Navigation Map

### Admin Panel

- `/admin/collections/assignments` — Assignments: title, module, instructions, dueDate, maxScore, rubric, criterion, maxPoints, description
- `/admin/collections/courses` — Courses: title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label
- `/admin/collections/enrollments` — Enrollments: student, course, enrolledAt, status, completedAt, completedLessons
- `/admin/collections/lessons` — Lessons: title, course, module, order, type, content, videoUrl, estimatedMinutes
- `/admin/collections/media` — Media: alt
- `/admin/collections/notifications` — Notifications: recipient, type, title, message, link, isRead
- `/admin/collections/quiz-attempts` — QuizAttempts: user, quiz, score, passed, answers, questionIndex, answer, startedAt, completedAt
- `/admin/collections/quizzes` — Quizzes: title, module, order, passingScore, timeLimit, maxAttempts, questions, text, type, options
- `/admin/collections/submissions` — Submissions: assignment, student, content, attachments, file, submittedAt, status, grade, feedback, rubricScores
- `/admin/collections/users` — Users: firstName, lastName, displayName, avatar, bio, role, organization, refreshToken, tokenExpiresAt, lastTokenUsedAt
- `/admin/collections/certificates` — Certificates: student, course, issuedAt, certificateNumber, finalGrade
- `/admin/collections/notes` — Notes: title, content, tags

### Frontend Pages

- `/` — Home page
- `/dashboard` — User dashboard
- `/instructor/courses/:id/edit` — Course editor for instructors
- `/notes` — Notes list view
- `/notes/:id` — Note detail view
- `/notes/create` — Create new note
- `/notes/edit/:id` — Edit existing note

### API Endpoints

- `GET/POST /api/notes` — Note CRUD with search
- `GET/POST /api/notes/[id]` — Note by ID
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading
- `GET /api/quizzes/[id]/attempts` — User quiz attempts
- `GET /api/courses/search` — Course search
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)

## Component Verification Patterns

**Payload CMS Admin Collections**: Navigate to `/admin/collections/{slug}` — verify list view loads with expected columns, click row to open edit form, verify all fields render correctly.

**Notes CRUD**: Navigate to `/notes/create` — fill title and content fields, submit, verify redirect to `/notes/:id`. Edit at `/notes/edit/:id`, delete and verify return to `/notes`.

**Course Editor**: Navigate to `/instructor/courses/:id/edit` — verify CourseLessonsSorter component shows drag-sortable lessons grouped by module.

## Common Test Scenarios

1. **Auth Flow**: Login → verify dashboard redirect → logout → verify protected routes redirect to `/login`
2. **Notes CRUD**: Create note at `/notes/create`, view at `/notes/:id`, edit at `/notes/edit/:id`, verify list at `/notes`
3. **Admin Collection CRUD**: Navigate to collection list, create new document, edit it, delete it
4. **Role Access**: Login as each role, verify correct nav items and access restrictions

## Environment Setup

- `DATABASE_URL` — PostgreSQL connection string
- `PAYLOAD_SECRET` — Secret for Payload CMS

## Dev Server

- Command: `pnpm dev`
- URL: http://localhost:3000
