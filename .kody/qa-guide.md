# QA Guide

## Quick Reference

- **Dev server:** `pnpm dev` at `http://localhost:3000`
- **Login page:** `/login`
- **Admin panel:** `/admin` (Payload CMS 3.80.0)

## Authentication

### Test Accounts

| Role   | Email              | Password  |
| ------ | ------------------ | --------- |
| Admin  | admin@example.com  | CHANGE_ME |
| Editor | editor@example.com | CHANGE_ME |
| Viewer | viewer@example.com | CHANGE_ME |

### Login Steps

1. Navigate to `/login`
2. Enter email and password from test accounts table
3. Submit the form
4. Verify redirect to `/dashboard`

### Auth Files

- `src/auth/` — withAuth HOC, JWT service, session store
- `src/middleware/` — request logger, rate limiter
- `src/security/sanitizers.ts` — sanitizeHtml, sanitizeSql, sanitizeUrl

## Roles

`admin`, `Engineer`, `CEO`, `CTO`, `Researcher`

## Navigation Map

### Admin Panel

- `/admin` — Payload CMS admin dashboard
- `/admin/collections/assignments` — Assignments collection; fields: title, module, instructions, dueDate, maxScore, rubric, criterion, maxPoints, description
- `/admin/collections/certificates` — Certificates; fields: student, course, issuedAt, certificateNumber, finalGrade
- `/admin/collections/courses` — Courses; fields: title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label
- `/admin/collections/enrollments` — Enrollments; fields: student, course, enrolledAt, status, completedAt, completedLessons
- `/admin/collections/lessons` — Lessons; fields: title, course, module, order, type, content, videoUrl, estimatedMinutes
- `/admin/collections/media` — Media; fields: alt
- `/admin/collections/modules` — Modules; fields: title, course, order, description
- `/admin/collections/notes` — Notes; fields: title, content, tags
- `/admin/collections/notifications` — Notifications; fields: recipient, type, title, message, link, isRead
- `/admin/collections/quiz-attempts` — QuizAttempts; fields: user, quiz, score, passed, answers, questionIndex, answer, startedAt, completedAt
- `/admin/collections/quizzes` — Quizzes; fields: title, module, order, passingScore, timeLimit, maxAttempts, questions, text, type, options
- `/admin/collections/submissions` — Submissions; fields: assignment, student, content, attachments, file, submittedAt, status, grade, feedback, rubricScores
- `/admin/collections/users` — Users; fields: firstName, lastName, displayName, avatar, bio, role, organization, refreshToken, tokenExpiresAt, lastTokenUsedAt

### Frontend Pages

- `/` — Homepage
- `/dashboard` — User dashboard
- `/instructor/courses/:id/edit` — Course editor (instructor role required)
- `/notes` — Notes list
- `/notes/create` — Create note
- `/notes/:id` — View note
- `/notes/edit/:id` — Edit note

### API Endpoints

- `GET/POST /api/notes` — Note CRUD with search
- `GET /api/notes/[id]` — Single note retrieval
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search
- `POST /api/enroll` — Enrollment
- `GET /api/gradebook/course/[id]` — Grades per course

## Component Verification Patterns

- **CourseLessonsSorter** — Drag-sortable lessons grouped by module on course edit page
- **LessonEditor** — Rich text/video lesson content editing
- **QuizGrader** — Auto-grading for quiz submissions
- **NotificationBell** — Unread notification indicator in header

## Common Test Scenarios

1. **Auth flow:** Login → verify redirect → access protected routes
2. **Course CRUD:** Create course → add modules → add lessons → publish
3. **Quiz submission:** Start quiz → answer questions → submit → verify grade
4. **Enrollment:** Browse courses → enroll → verify in enrollments list
5. **Admin CRUD:** Navigate to collection → create record → edit → delete

## Environment Setup

Required env vars:

- `DATABASE_URL` — PostgreSQL connection string
- `PAYLOAD_SECRET` — JWT secret for Payload CMS

## Dev Server

```bash
pnpm dev
```

Runs at `http://localhost:3000`

## Rules

- Be specific to this project — use actual collection names, routes, and component names
- For admin panels, use exact `/admin/collections/{slug}` paths
- Visual assertions: "verify X is visible on page"
- Interaction tests: "click button X", "fill field Y", "drag item Z"
- Keep guide under 200 lines
