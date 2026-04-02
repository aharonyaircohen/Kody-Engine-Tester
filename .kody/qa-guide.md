# QA Guide

## Quick Reference

- **Dev server**: `pnpm dev` → http://localhost:3000
- **Login page**: http://localhost:3000/admin/login (Payload CMS auth)
- **Admin panel**: http://localhost:3000/admin

## Authentication

### Test Accounts

| Role       | Email                  | Password                  |
| ---------- | ---------------------- | ------------------------- |
| admin      | `$QA_ADMIN_EMAIL`      | `$QA_ADMIN_PASSWORD`      |
| Engineer   | `$QA_ENGINEER_EMAIL`   | `$QA_ENGINEER_PASSWORD`   |
| CEO        | `$QA_CEO_EMAIL`        | `$QA_CEO_PASSWORD`        |
| CTO        | `$QA_CTO_EMAIL`        | `$QA_CTO_PASSWORD`        |
| Researcher | `$QA_RESEARCHER_EMAIL` | `$QA_RESEARCHER_PASSWORD` |

### Login Steps

1. Navigate to http://localhost:3000/admin/login
2. Fill **Email** field with test account email
3. Fill **Password** field with test account password
4. Click **Login** button
5. Verify redirect to `/admin` dashboard — you should see the Payload CMS dashboard with collection list

### Auth Files

- `src/auth/` — auth utilities and user store
- `src/middleware/` — role guards, rate limiting
- `src/collections/Users.ts` — user schema with `role`, `refreshToken`, `tokenExpiresAt`

## Navigation Map

### Admin Panel

- `/admin` — Dashboard; verify collection list sidebar shows: Assignments, Courses, Enrollments, Lessons, Media, Notifications, Quiz Attempts, Quizzes, Submissions, Users, Certificates, Notes
- `/admin/collections/courses` — Courses list; verify columns title, slug, status, difficulty
- `/admin/collections/courses/create` — Course create form; verify fields: title, slug, description, thumbnail (media picker), instructor (relation), status (select), difficulty (select), estimatedHours, tags, label
- `/admin/collections/lessons` — Lessons list; verify columns title, course, module, order, type
- `/admin/collections/lessons/create` — Lesson create form; verify fields: title, course (relation), module, order, type (select), content (Lexical rich text), videoUrl, estimatedMinutes
- `/admin/collections/users` — Users list; verify columns firstName, lastName, displayName, role
- `/admin/collections/users/create` — User create form; verify fields: firstName, lastName, displayName, avatar, bio, role (select), organization
- `/admin/collections/quizzes` — Quizzes list; verify columns title, module, passingScore
- `/admin/collections/quizzes/create` — Quiz create form; verify fields: title, module, order, passingScore, timeLimit, maxAttempts, questions (array with text, type, options)
- `/admin/collections/assignments` — Assignments list; verify columns title, module, dueDate, maxScore
- `/admin/collections/assignments/create` — Assignment create form; verify fields: title, module, instructions (rich text), dueDate, maxScore, rubric (array with criterion, maxPoints, description)
- `/admin/collections/enrollments` — Enrollments list; verify columns student, course, status
- `/admin/collections/submissions` — Submissions list; verify columns assignment, student, status, grade
- `/admin/collections/certificates` — Certificates list; verify columns student, course, issuedAt, certificateNumber, finalGrade
- `/admin/collections/notes` — Notes list; verify columns title, tags
- `/admin/collections/notifications` — Notifications list; verify columns recipient, type, title, isRead
- `/admin/collections/quiz-attempts` — Quiz Attempts list; verify columns user, quiz, score, passed

### Frontend Pages

- `/` — Homepage; verify page loads without errors
- `/dashboard` — User dashboard; requires auth; verify dashboard widgets visible
- `/notes` — Notes list; verify notes cards or table render
- `/notes/create` — Note creation form; verify title, content, tags fields present
- `/notes/:id` — Note detail view; verify note content renders
- `/notes/edit/:id` — Note edit form; verify fields pre-populated
- `/instructor/courses/:id/edit` — Course editor; requires instructor role; verify course fields editable

### API Endpoints

- `GET/POST /api/courses` — Courses REST collection
- `GET/PATCH/DELETE /api/courses/:id` — Single course
- `GET/POST /api/users` — Users REST collection
- `GET/POST /api/lessons` — Lessons REST collection
- `GET/POST /api/enrollments` — Enrollments REST collection
- `GET/POST /api/submissions` — Submissions REST collection
- `POST /api/users/login` — Login endpoint
- `POST /api/users/logout` — Logout endpoint

## Component Verification Patterns

### Lexical Rich Text Editor

- Found on: lesson content field (`/admin/collections/lessons/create`), assignment instructions, note content
- Verify the editor toolbar is visible (Bold, Italic, Link buttons at minimum)
- Type text, apply bold, verify `<strong>` styling appears in preview

### Media Picker (course thumbnail)

- Found on: `/admin/collections/courses/create` → thumbnail field
- Click **Choose from existing** — verify media library modal opens with upload option
- Verify image preview renders after selection

### Relation Fields

- Found on: courses → instructor (users), lessons → course, enrollments → student + course
- Click relation field — verify dropdown/search opens
- Type to search — verify filtered results appear
- Select item — verify display name appears in field

### Array Fields (quiz questions, rubric criteria)

- Found on: `/admin/collections/quizzes/create` → questions, `/admin/collections/assignments/create` → rubric
- Click **Add row** — verify new row appears
- Fill fields in row — verify inputs accept values
- Click row delete — verify row removed

## Common Test Scenarios

### Create Course

1. Login as admin → `/admin/collections/courses/create`
2. Fill title, slug, select status=`published`, difficulty=`beginner`
3. Click **Save** — verify success toast, redirect to edit view with generated ID

### Enroll Student in Course

1. Login as admin → `/admin/collections/enrollments/create`
2. Select student (relation), select course (relation), set status=`active`
3. Click **Save** — verify enrollment record created

### Admin Auth Redirect

1. Navigate to `/admin/collections/users` while logged out
2. Verify redirect to `/admin/login`
3. Login — verify redirect back to intended page

### Note CRUD (Frontend)

1. Login → navigate to `/notes/create`
2. Fill title, content, tags — click Save
3. Verify redirect to `/notes/:id` with content visible
4. Navigate to `/notes/edit/:id` — edit title — save
5. Verify updated title on detail page

### Role Access Guard

1. Login as `Researcher` → attempt `/instructor/courses/1/edit`
2. Verify access denied or redirect (role guard enforced)

## Environment Setup

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/learnhub
PAYLOAD_SECRET=your-32-char-secret
```

## Dev Server

```bash
pnpm dev
# → http://localhost:3000
```
