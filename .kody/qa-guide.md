# QA Guide

## Quick Reference

- Dev server: `pnpm dev` at http://localhost:3000
- Login page: `/login`
- Admin panel: `/admin` (wildcard: `/admin/:...segments?`)

## Authentication

### Test Accounts

| Role  | Email            | Password            |
| ----- | ---------------- | ------------------- |
| Admin | `QA_ADMIN_EMAIL` | `QA_ADMIN_PASSWORD` |
| User  | `QA_USER_EMAIL`  | `QA_USER_PASSWORD`  |

### Login Steps

1. Navigate to `/login`
2. Enter credentials from the test accounts table above
3. Submit the login form
4. Verify redirect to dashboard or home page

### Auth Files

- `src/auth/`

## Roles

- `admin`
- `Engineer`
- `CEO`
- `CTO`
- `Researcher`

## Navigation Map

### Admin Panel

#### Collections Management

- `/admin/collections/assignments` — Assignments list and edit form. Fields: title, module, instructions, dueDate, maxScore, rubric, criterion, maxPoints, description
- `/admin/collections/courses` — Courses list and edit form. Fields: title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label, maxEnrollments, quizWeight, assignmentWeight
- `/admin/collections/enrollments` — Enrollments list. Fields: student, course, enrolledAt, status, completedAt, completedLessons
- `/admin/collections/lessons` — Lessons list. Fields: title, course, module, order, type, content, videoUrl, estimatedMinutes
- `/admin/collections/media` — Media uploads. Fields: alt
- `/admin/collections/notifications` — Notifications list. Fields: recipient, type, title, message, link, isRead
- `/admin/collections/quiz-attempts` — Quiz attempts. Fields: user, quiz, score, passed, answers, questionIndex, answer, startedAt, completedAt
- `/admin/collections/quizzes` — Quizzes list. Fields: title, module, order, passingScore, timeLimit, maxAttempts, questions, text, type, options, isCorrect, correctAnswer, points
- `/admin/collections/submissions` — Submissions list. Fields: assignment, student, content, attachments, file, submittedAt, status, grade, feedback, rubricScores, criterion, score, comment
- `/admin/collections/users` — Users list. Fields: firstName, lastName, displayName, avatar, bio, role, organization, refreshToken, tokenExpiresAt, lastTokenUsedAt
- `/admin/collections/certificates` — Certificates list. Fields: student, course, issuedAt, certificateNumber, finalGrade
- `/admin/collections/notes` — Notes list. Fields: title, content, tags

### Frontend Pages

- `/` — Home page with course listings
- `/dashboard` — User dashboard with enrollments and progress
- `/instructor/courses/:id/edit` — Course editor for instructors
- `/notes` — Notes list view
- `/notes/:id` — Single note view
- `/notes/create` — Create new note
- `/notes/edit/:id` — Edit existing note

### API Endpoints

- `GET/POST /api/notes` — Note CRUD with search
- `GET /api/notes/[id]` — Single note retrieval
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)

## Component Verification Patterns

### Payload CMS Admin Components

- Collection lists show data table with sortable columns
- Edit forms display all collection fields with appropriate input types
- Media field shows image preview after upload
- Relationship fields render as dropdowns/pickers
- Rich text fields render as WYSIWYG editors

### Frontend Components

- Navigation: verify role-based menu items appear
- Forms: verify validation messages on invalid input
- Lists: verify pagination, empty states, and loading skeletons

## Common Test Scenarios

### Admin Workflows

1. Create a new course with all fields
2. Edit an existing course
3. Upload media and attach to a course
4. View and manage user enrollments
5. Review quiz submissions and grade assignments

### Frontend Workflows

1. User login and dashboard access
2. Browse and enroll in courses
3. Create and edit personal notes
4. Take a quiz and view results
5. View certificate upon course completion

## Environment Setup

Required env vars:

- `DATABASE_URL`
- `PAYLOAD_SECRET`
- `QA_ADMIN_EMAIL`
- `QA_ADMIN_PASSWORD`
- `QA_USER_EMAIL`
- `QA_USER_PASSWORD`

## Dev Server

- Command: `pnpm dev`
- URL: `http://localhost:3000`

## Rules

- Be SPECIFIC to this project — reference actual URLs, collection names, component names
- For admin panels (Payload CMS), use exact `/admin/collections/{slug}` paths
- Include visual assertions: "verify X is visible", "you should see Y"
- Include interaction tests: "click button X", "fill field Y"
- Keep under 200 lines total
- Output ONLY the markdown
