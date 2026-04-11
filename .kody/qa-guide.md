# QA Guide

## Quick Reference

- Dev server: `pnpm dev` at http://localhost:3000
- Login: `/login`
- Admin panel: `/admin/:...segments?`

## Authentication

### Test Accounts

| Role  | Email          | Password          |
| ----- | -------------- | ----------------- |
| Admin | QA_ADMIN_EMAIL | QA_ADMIN_PASSWORD |
| User  | QA_USER_EMAIL  | QA_USER_PASSWORD  |

### Login Steps

1. Navigate to `/login`
2. Enter credentials from the test accounts table above
3. Submit the login form
4. Verify redirect to dashboard or home page

### Auth Files

- `src/auth`

## Roles

- `admin`
- `Engineer`
- `CEO`
- `CTO`
- `Researcher`

## Navigation Map

### Admin Panel

- `/admin` — Payload CMS admin dashboard
- `/admin/collections/assignments` — Assignments list with title, module, dueDate, maxScore fields
- `/admin/collections/courses` — Courses list with title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label, maxEnrollments, quizWeight, assignmentWeight fields
- `/admin/collections/enrollments` — Enrollments list with student, course, enrolledAt, status, completedAt, completedLessons fields
- `/admin/collections/lessons` — Lessons list with title, course, module, order, type, content, videoUrl, estimatedMinutes fields
- `/admin/collections/media` — Media list with alt field
- `/admin/collections/modules` — Modules list with title, course, order, description fields
- `/admin/collections/notifications` — Notifications list with recipient, type, title, message, link, isRead fields
- `/admin/collections/quiz-attempts` — Quiz attempts list with user, quiz, score, passed, answers, questionIndex, answer, startedAt, completedAt fields
- `/admin/collections/quizzes` — Quizzes list with title, module, order, passingScore, timeLimit, maxAttempts, questions, text, type, options, isCorrect, correctAnswer, points fields
- `/admin/collections/submissions` — Submissions list with assignment, student, content, attachments, file, submittedAt, status, grade, feedback, rubricScores, criterion, score, comment fields
- `/admin/collections/users` — Users list with firstName, lastName, displayName, avatar, bio, role, organization, refreshToken, tokenExpiresAt, lastTokenUsedAt fields
- `/admin/collections/certificates` — Certificates list with student, course, issuedAt, certificateNumber, finalGrade fields
- `/admin/collections/notes` — Notes list with title, content, tags fields

### Frontend Pages

- `/` — Home page
- `/dashboard` — Dashboard for logged-in users
- `/instructor/courses/:id/edit` — Course editor for instructors
- `/notes` — Notes list page
- `/notes/:id` — Note detail page
- `/notes/create` — Create new note
- `/notes/edit/:id` — Edit existing note

### API Endpoints

- `GET/POST /api/notes` — Note CRUD with search
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `QuizGrader`
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService`
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)

## Component Verification Patterns

- **CourseLessonsSorter** (at `/instructor/courses/:id/edit`): Verify drag-sortable lessons grouped by chapter
- **NoteEditor**: Verify title, content, tags fields at `/notes/create` and `/notes/edit/:id`
- **QuizForm**: Verify questions, options, passingScore, timeLimit at quiz edit pages

## Common Test Scenarios

1. **Login flow**: Navigate to `/login`, submit credentials, verify redirect to `/dashboard`
2. **Admin CRUD**: Navigate to `/admin/collections/{slug}`, create/read/update/delete items
3. **Course editing**: Navigate to `/instructor/courses/:id/edit`, modify fields, save and verify
4. **Note management**: Create note at `/notes/create`, edit at `/notes/edit/:id`, delete from `/notes/:id`
5. **Quiz submission**: Start quiz, answer questions, submit, verify score and passed status

## Environment Setup

Required env vars to start the dev server:

- `DATABASE_URL`
- `PAYLOAD_SECRET`
- `QA_ADMIN_EMAIL` — Admin login email
- `QA_ADMIN_PASSWORD` — Admin login password
- `QA_USER_EMAIL` — User login email
- `QA_USER_PASSWORD` — User login password

## Dev Server

- Command: `pnpm dev`
- URL: http://localhost:3000
