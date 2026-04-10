# QA Guide

## Quick Reference

- Dev server: `pnpm dev` at http://localhost:3000
- Login page: `/login`
- Admin panel: `/admin`

## Authentication

### Test Accounts

| Role       | Email                  | Password  |
| ---------- | ---------------------- | --------- |
| Admin      | admin@example.com      | CHANGE_ME |
| Engineer   | engineer@example.com   | CHANGE_ME |
| CEO        | ceo@example.com        | CHANGE_ME |
| CTO        | cto@example.com        | CHANGE_ME |
| Researcher | researcher@example.com | CHANGE_ME |

### Login Steps

1. Navigate to `/login`
2. Enter credentials from the test accounts table above
3. Submit the login form
4. Verify redirect to dashboard or home page

### Auth Files

- `src/auth/session-store.ts`
- `src/auth/user-store.ts`
- `src/auth/jwt-service.ts`
- `src/auth/withAuth.ts`

## Roles

- `admin`
- `Engineer`
- `CEO`
- `CTO`
- `Researcher`

## Navigation Map

### Frontend Pages

- `/` — Home page
- `/dashboard` — Dashboard with enrolled courses, recent activity
- `/instructor/courses/:id/edit` — Course editor with title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label fields
- `/notes` — Notes list view
- `/notes/:id` — Single note view
- `/notes/create` — Note creation form
- `/notes/edit/:id` — Note edit form

### Admin Panel

- `/admin` — Payload CMS admin dashboard
- `/admin/collections/assignments` — Assignments list with title, module, instructions, dueDate, maxScore, rubric fields
- `/admin/collections/courses` — Courses editor with title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label fields
- `/admin/collections/enrollments` — Enrollments list with student, course, enrolledAt, status, completedAt, completedLessons fields
- `/admin/collections/lessons` — Lessons editor with title, course, module, order, type, content, videoUrl, estimatedMinutes fields
- `/admin/collections/media` — Media manager with alt field
- `/admin/collections/modules` — Modules editor with title, course, order, description fields
- `/admin/collections/notifications` — Notifications list with recipient, type, title, message, link, isRead fields
- `/admin/collections/quiz-attempts` — Quiz attempts with user, quiz, score, passed, answers, questionIndex, answer, startedAt, completedAt fields
- `/admin/collections/quizzes` — Quiz editor with title, module, order, passingScore, timeLimit, maxAttempts, questions, text, type, options fields
- `/admin/collections/submissions` — Submissions list with assignment, student, content, attachments, file, submittedAt, status, grade, feedback, rubricScores fields
- `/admin/collections/users` — User management with firstName, lastName, displayName, avatar, bio, role, organization, refreshToken, tokenExpiresAt, lastTokenUsedAt fields
- `/admin/collections/certificates` — Certificates with student, course, issuedAt, certificateNumber, finalGrade fields
- `/admin/collections/notes` — Notes with title, content, tags fields

### API Endpoints

- `GET/POST /api/notes` — Note CRUD with search
- `GET /api/notes/[id]` — Single note retrieval
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading
- `GET /api/quizzes/[id]/attempts` — User quiz attempts
- `GET /api/courses/search` — Course search
- `POST /api/enroll` — Enrollment
- `GET /api/gradebook/course/[id]` — Course grades (editor/admin)

## Component Verification Patterns

### Admin Collections

- **List views**: Verify table with rows, click row to edit, use sidebar filters
- **Edit forms**: Verify all fields render, save button posts to API, toast notification on success
- **Custom fields**: Verify slug auto-generates from title, thumbnail upload preview works, rich text editor loads

### Frontend Pages

- **Dashboard**: Verify enrolled courses display, recent activity loads
- **Course editor**: Verify drag-sortable modules/lessons, auto-save indicator
- **Notes**: Verify create/edit forms, tag input, search filters

## Common Test Scenarios

1. **Auth flow**: Login → verify redirect → logout → verify redirect to `/login`
2. **Admin CRUD**: Navigate to collection → create record → edit → delete → verify removal
3. **Course enrollment**: Login as student → browse courses → enroll → verify on dashboard
4. **Quiz submission**: Start quiz → answer questions → submit → verify score display
5. **Note CRUD**: Create note → edit → delete → verify list updates

## Environment Setup

```
DATABASE_URL=<postgres-connection-string>
PAYLOAD_SECRET=<secret-key>
```

## Dev Server

- Command: `pnpm dev`
- URL: http://localhost:3000
