# QA Guide

## Quick Reference

- **Dev server:** `pnpm dev` → http://localhost:3000
- **Login page:** `/login`
- **Admin panel:** `/admin`

## Authentication

### Test Accounts

| Role   | Email                | Password                |
| ------ | -------------------- | ----------------------- |
| Admin  | `${QA_ADMIN_EMAIL}`  | `${QA_ADMIN_PASSWORD}`  |
| Editor | `${QA_EDITOR_EMAIL}` | `${QA_EDITOR_PASSWORD}` |

### Login Steps

1. Navigate to `/login`
2. Enter email and password
3. Click submit button
4. Verify redirect to `/dashboard`

### Auth Files

- `src/auth/withAuth.ts` — JWT validation HOC
- `src/auth/JwtService.ts` — Web Crypto JWT handling
- `src/contexts/auth-context.tsx` — Client auth state

## Roles

`admin`, `Engineer`, `CEO`, `CTO`, `Researcher`

## Navigation Map

### Admin Panel

| Path                               | What to Expect                                      |
| ---------------------------------- | --------------------------------------------------- |
| `/admin`                           | Payload admin dashboard, collection list            |
| `/admin/collections/assignments`   | Assignment list with title, module, dueDate columns |
| `/admin/collections/courses`       | Course list with title, slug, instructor, status    |
| `/admin/collections/enrollments`   | Enrollment list, student/course relationship        |
| `/admin/collections/lessons`       | Lesson list grouped by module                       |
| `/admin/collections/media`         | Media gallery, alt text field                       |
| `/admin/collections/modules`       | Module list with course, order, description         |
| `/admin/collections/notifications` | Notification list, read/unread status               |
| `/admin/collections/quiz-attempts` | Quiz attempt history per user                       |
| `/admin/collections/quizzes`       | Quiz editor with questions, passingScore, timeLimit |
| `/admin/collections/submissions`   | Submission list with status, grade columns          |
| `/admin/collections/users`         | User list with role, organization                   |
| `/admin/collections/certificates`  | Certificate list with student, course, finalGrade   |
| `/admin/collections/notes`         | Notes list with title, content preview              |
| `/admin/globals`                   | Global settings                                     |

### Frontend Pages

| Path                           | Expected Content                 | Key Interactions          |
| ------------------------------ | -------------------------------- | ------------------------- |
| `/`                            | Home/landing page                | Navigation links          |
| `/dashboard`                   | User dashboard, enrolled courses | Click course card         |
| `/instructor/courses/:id/edit` | Course editor                    | Edit title, save          |
| `/notes`                       | Notes list                       | Click create/edit note    |
| `/notes/:id`                   | Note detail view                 | Verify content            |
| `/notes/create`                | New note form                    | Fill title, content, save |
| `/notes/edit/:id`              | Edit note form                   | Modify and save           |

### API Endpoints

| Path                        | Methods          | Purpose                |
| --------------------------- | ---------------- | ---------------------- |
| `/api/notes`                | GET, POST        | Note CRUD, search      |
| `/api/notes/:id`            | GET, PUT, DELETE | Single note operations |
| `/api/courses/search`       | GET              | Course search          |
| `/api/enroll`               | POST             | Enrollment             |
| `/api/gradebook/course/:id` | GET              | Grades per course      |

## Admin Collections

### `/admin/collections/assignments`

- **Fields:** title, module, instructions, dueDate, maxScore, rubric, criterion, maxPoints, description

### `/admin/collections/courses`

- **Fields:** title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label

### `/admin/collections/enrollments`

- **Fields:** student, course, enrolledAt, status, completedAt, completedLessons

### `/admin/collections/lessons`

- **Fields:** title, course, module, order, type, content, videoUrl, estimatedMinutes

### `/admin/collections/media`

- **Fields:** alt

### `/admin/collections/modules`

- **Fields:** title, course, order, description

### `/admin/collections/notifications`

- **Fields:** recipient, type, title, message, link, isRead

### `/admin/collections/quiz-attempts`

- **Fields:** user, quiz, score, passed, answers, questionIndex, answer, startedAt, completedAt

### `/admin/collections/quizzes`

- **Fields:** title, module, order, passingScore, timeLimit, maxAttempts, questions, text, type, options

### `/admin/collections/submissions`

- **Fields:** assignment, student, content, attachments, file, submittedAt, status, grade, feedback, rubricScores

### `/admin/collections/users`

- **Fields:** firstName, lastName, displayName, avatar, bio, role, organization

### `/admin/collections/certificates`

- **Fields:** student, course, issuedAt, certificateNumber, finalGrade

### `/admin/collections/notes`

- **Fields:** title, content, tags

## Component Verification Patterns

### Drag-and-Drop Module Reordering

- **Location:** `/instructor/courses/:id/edit` → ModuleList component
- **Verify:** Drag handle visible on each module row
- **Test:** Drag module A below module B, verify order persists after refresh

### Course Editor

- **Location:** `/instructor/courses/:id/edit`
- **Verify:** Title, slug, description fields visible; thumbnail upload present
- **Test:** Edit title → save → verify change reflected in course list

### Note Editor

- **Location:** `/notes/create`, `/notes/edit/:id`
- **Verify:** Title input, content textarea, tags field
- **Test:** Create note → navigate to `/notes/:id` → verify content matches

## Common Test Scenarios

1. **Admin Login Flow:** `/login` → admin credentials → redirect to `/admin`
2. **Create Course:** `/admin/collections/courses/create` → fill required fields → save → verify in list
3. **Student Enrollment:** Create enrollment via `/admin/collections/enrollments/create` → verify on user dashboard
4. **Quiz Submission:** Student takes quiz → submit answers → verify `/admin/collections/quiz-attempts` shows score
5. **Note CRUD:** Create note → edit → delete → verify list updates
6. **Role Guard:** Attempt `/admin` as non-admin → verify access denied redirect

## Environment Setup

```
DATABASE_URL=postgresql://...
PAYLOAD_SECRET=your-secret-here
```

## Dev Server

- **Command:** `pnpm dev`
- **URL:** http://localhost:3000

## Rules

- Always verify dev server is running before testing
- Use test accounts with minimal privileges for non-admin tests
- Clear browser state between role-switching tests
- Verify API responses in DevTools network tab when debugging
