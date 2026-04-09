# QA Guide

## Quick Reference

- Dev server command: `pnpm dev`
- Dev server URL: http://localhost:3000
- Login page URL: `/login`
- Admin panel URL: `/admin/:...segments?`

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

### Frontend Pages

- `/` — Home page
- `/dashboard` — User dashboard
- `/instructor/courses/:id/edit` — Course editor
- `/notes` — Notes list
- `/notes/:id` — Note detail
- `/notes/create` — Create note
- `/notes/edit/:id` — Edit note

### Admin Collections

#### `/admin/collections/assignments`

- **Name:** Assignments
- **Fields:** title, module, instructions, dueDate, maxScore, rubric, criterion, maxPoints, description

#### `/admin/collections/certificates`

- **Name:** certificates
- **Fields:** student, course, issuedAt, certificateNumber, finalGrade

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

#### `/admin/collections/notes`

- **Name:** notes
- **Fields:** title, content, tags

### API Endpoints

- `GET/POST /api/notes` — Note CRUD with search
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search
- `POST /api/enroll` — Enrollment
- `GET /api/gradebook/course/[id]` — Grades per course

## Component Verification Patterns

### Payload CMS Admin Components

- Navigate to `/admin/collections/{collection-slug}` to access each collection
- Verify collection name appears as page heading
- Verify list view shows expected columns
- Click "Create" button to verify creation form has all documented fields
- Click any row to verify edit form loads correctly

### Frontend Components

- `/dashboard` — Verify user-specific content loads (enrolled courses, recent activity)
- `/instructor/courses/:id/edit` — Verify course editor with all course fields accessible
- `/notes` — Verify notes list with create button visible
- `/notes/create` and `/notes/edit/:id` — Verify rich text editor for content field

## Common Test Scenarios

1. **Login Flow:** Navigate to `/login` → Enter credentials → Verify redirect to `/dashboard`
2. **Admin CRUD:** Navigate to `/admin/collections/notes` → Create new note → Edit note → Delete note
3. **Course Enrollment:** Login as student → Browse `/` → Enroll in course → Verify on `/dashboard`
4. **Quiz Submission:** Login as student → Navigate to quiz → Submit answers → Verify score on `/dashboard`

## Environment Setup

Required env vars:

- `DATABASE_URL`
- `PAYLOAD_SECRET`

## Dev Server

- Command: `pnpm dev`
- URL: http://localhost:3000

## Rules

- Be SPECIFIC to this project — reference actual URLs, collection names, component names
- For admin panels (Payload CMS), use exact `/admin/collections/{slug}` paths
- Include visual assertions: "you should see X", "verify Y is visible"
- Include interaction tests: "click button X", "fill field Y", "drag item Z"
- Keep under 200 lines total
