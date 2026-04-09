# QA Guide

## Quick Reference

- Dev server command: `pnpm dev`
- Dev server URL: http://localhost:3000
- Login page URL: `/login`
- Admin panel URL: `/admin`

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

- `src/auth/auth-service.ts` — register, login, logout operations
- `src/auth/jwt-service.ts` — JWT token creation/verification
- `src/auth/session-store.ts` — server-side session management
- `src/auth/user-store.ts` — user persistence helpers
- `src/auth/withAuth.ts` — HOC for route protection with role support

## Roles

- `admin`
- `Engineer`
- `CEO`
- `CTO`
- `Researcher`

## Navigation Map

### Admin Panel

**Collections:**

- `/admin/collections/assignments` — Assignments edit form with title, module, instructions, dueDate, maxScore, rubric, criterion, maxPoints, description fields
- `/admin/collections/certificates` — Certificates edit form with student, course, issuedAt, certificateNumber, finalGrade fields
- `/admin/collections/courses` — Courses edit form with title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label fields. Custom CourseLessonsSorter component shows drag-sortable lessons grouped by chapter
- `/admin/collections/enrollments` — Enrollments edit form with student, course, enrolledAt, status, completedAt, completedLessons fields
- `/admin/collections/lessons` — Lessons edit form with title, course, module, order, type, content, videoUrl, estimatedMinutes fields
- `/admin/collections/media` — Media edit form with alt field
- `/admin/collections/modules` — Modules edit form with title, course, order, description fields
- `/admin/collections/notifications` — Notifications edit form with recipient, type, title, message, link, isRead fields
- `/admin/collections/quiz-attempts` — QuizAttempts edit form with user, quiz, score, passed, answers, questionIndex, answer, startedAt, completedAt fields
- `/admin/collections/quizzes` — Quizzes edit form with title, module, order, passingScore, timeLimit, maxAttempts, questions, text, type, options fields
- `/admin/collections/submissions` — Submissions edit form with assignment, student, content, attachments, file, submittedAt, status, grade, feedback, rubricScores fields
- `/admin/collections/users` — Users edit form with firstName, lastName, displayName, avatar, bio, role, organization, refreshToken, tokenExpiresAt, lastTokenUsedAt fields
- `/admin/collections/notes` — Notes edit form with title, content, tags fields

### Frontend Pages

- `/` — Home page with course listings and featured content
- `/dashboard` — Student dashboard showing enrolled courses, progress, and recent activity
- `/instructor/courses/:id/edit` — Course editor for instructors with ModuleList component, drag-sortable lessons grouped by chapter
- `/notes` — Notes listing page
- `/notes/create` — Create new note form
- `/notes/:id` — Single note view page
- `/notes/edit/:id` — Edit existing note form

### API Endpoints

- `GET/POST /api/notes` — Note CRUD with search
- `GET /api/notes/[id]` — Single note retrieval
- `GET /api/courses/search` — Course search with filtering
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via QuizGrader
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts

## Component Verification Patterns

### CourseLessonsSorter

- **Location:** `/instructor/courses/:id/edit`
- **Visual:** Drag-sortable list of lessons grouped under module/chapter headers
- **Interaction:** Drag lesson items to reorder within or across modules; verify order persists after refresh

### ModuleList

- **Location:** `/instructor/courses/:id/edit`
- **Visual:** List of modules with nested lessons, expand/collapse toggles
- **Interaction:** Click module header to expand/collapse; drag modules to reorder

## Common Test Scenarios

### Admin Collection CRUD

1. Navigate to `/admin/collections/{collection}`
2. Verify list view loads with data
3. Click "Create" button
4. Fill required fields and submit
5. Verify new record appears in list
6. Click record to edit
7. Modify fields and save
8. Verify changes persist

### Student Enrollment Flow

1. Login as student role
2. Browse courses at `/`
3. Click course to view details
4. Click enroll button
5. Verify enrollment at `/dashboard`

### Note Creation

1. Login and navigate to `/notes/create`
2. Fill title and content fields
3. Add tags if applicable
4. Submit form
5. Verify redirect to `/notes/:id` with created content

### Quiz Taking

1. Navigate to quiz via course module
2. Answer questions sequentially
3. Submit quiz
4. Verify score display and pass/fail status

## Environment Setup

Required env vars to start the dev server:

- `DATABASE_URL` — PostgreSQL connection string
- `PAYLOAD_SECRET` — Secret for Payload CMS encryption

## Dev Server

- Command: `pnpm dev`
- URL: http://localhost:3000
