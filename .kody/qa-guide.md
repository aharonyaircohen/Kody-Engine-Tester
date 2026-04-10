# QA Guide

## Quick Reference

- Dev server: `pnpm dev` at `http://localhost:3000`
- Login page: `/login`
- Admin panel: `/admin`

## Authentication

### Test Accounts

| Role  | Email      | Password   |
| ----- | ---------- | ---------- |
| Admin | (from env) | (from env) |
| User  | (from env) | (from env) |

### Login Steps

1. Navigate to `/login`
2. Enter email and password
3. Submit the login form
4. Verify redirect to `/dashboard` on success

### Auth Files

- `src/auth/` — Auth utilities, JWT service, session store
- `src/contexts/AuthContext.tsx` — Auth context provider
- `src/middleware/` — Auth middleware (rate limiting, role guards)

## Roles

- `admin`
- `Engineer`
- `CEO`
- `CTO`
- `Researcher`

## Navigation Map

### Admin Panel

| URL                                    | What to Expect              | Key Fields                                                                                          |
| -------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------- |
| `/admin`                               | Payload CMS admin dashboard | —                                                                                                   |
| `/admin/collections/assignments`       | Assignments list            | title, module, dueDate, maxScore                                                                    |
| `/admin/collections/assignments/:id`   | Assignment edit form        | title, module, instructions, dueDate, maxScore, rubric, criterion, maxPoints, description           |
| `/admin/collections/courses`           | Courses list                | title, slug, instructor, status, difficulty                                                         |
| `/admin/collections/courses/:id`       | Course edit form            | title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label    |
| `/admin/collections/enrollments`       | Enrollments list            | student, course, enrolledAt, status                                                                 |
| `/admin/collections/enrollments/:id`   | Enrollment edit form        | student, course, enrolledAt, status, completedAt, completedLessons                                  |
| `/admin/collections/lessons`           | Lessons list                | title, course, module, order, type                                                                  |
| `/admin/collections/lessons/:id`       | Lesson edit form            | title, course, module, order, type, content, videoUrl, estimatedMinutes                             |
| `/admin/collections/media`             | Media list                  | alt                                                                                                 |
| `/admin/collections/modules`           | Modules list                | title, course, order, description                                                                   |
| `/admin/collections/modules/:id`       | Module edit form            | title, course, order, description                                                                   |
| `/admin/collections/notifications`     | Notifications list          | recipient, type, title, isRead                                                                      |
| `/admin/collections/notifications/:id` | Notification edit form      | recipient, type, title, message, link, isRead                                                       |
| `/admin/collections/quiz-attempts`     | Quiz attempts list          | user, quiz, score, passed                                                                           |
| `/admin/collections/quiz-attempts/:id` | Quiz attempt edit form      | user, quiz, score, passed, answers, questionIndex, answer, startedAt, completedAt                   |
| `/admin/collections/quizzes`           | Quizzes list                | title, module, order, passingScore                                                                  |
| `/admin/collections/quizzes/:id`       | Quiz edit form              | title, module, order, passingScore, timeLimit, maxAttempts, questions, text, type, options          |
| `/admin/collections/submissions`       | Submissions list            | assignment, student, status, grade                                                                  |
| `/admin/collections/submissions/:id`   | Submission edit form        | assignment, student, content, attachments, file, submittedAt, status, grade, feedback, rubricScores |
| `/admin/collections/users`             | Users list                  | firstName, lastName, role, organization                                                             |
| `/admin/collections/users/:id`         | User edit form              | firstName, lastName, displayName, avatar, bio, role, organization                                   |
| `/admin/collections/certificates`      | Certificates list           | student, course, issuedAt, certificateNumber                                                        |
| `/admin/collections/certificates/:id`  | Certificate edit form       | student, course, issuedAt, certificateNumber, finalGrade                                            |
| `/admin/collections/notes`             | Notes list                  | title, tags                                                                                         |
| `/admin/collections/notes/:id`         | Note edit form              | title, content, tags                                                                                |

### Frontend Pages

| Path                           | Expected Content   | Key Interactions                  |
| ------------------------------ | ------------------ | --------------------------------- |
| `/`                            | Home page          | —                                 |
| `/dashboard`                   | User dashboard     | —                                 |
| `/instructor/courses/:id/edit` | Course editor      | Edit course fields, save changes  |
| `/notes`                       | Notes list         | Create note, click note to view   |
| `/notes/:id`                   | Note detail        | Edit button, delete button        |
| `/notes/create`                | Note creation form | Fill title, content, tags; submit |
| `/notes/edit/:id`              | Note edit form     | Modify fields; save               |

### API Endpoints

| Path                         | Methods   | Purpose                           |
| ---------------------------- | --------- | --------------------------------- |
| `/api/notes`                 | GET, POST | Note CRUD with search             |
| `/api/quizzes/[id]`          | GET       | Quiz retrieval                    |
| `/api/quizzes/[id]/submit`   | POST      | Quiz grading                      |
| `/api/quizzes/[id]/attempts` | GET       | User's quiz attempts              |
| `/api/courses/search`        | GET       | Course search                     |
| `/api/enroll`                | POST      | Enrollment (viewer role required) |
| `/api/gradebook/course/[id]` | GET       | Grades per course (editor/admin)  |

## Component Verification Patterns

### Admin Components

- **Payload Collection Tables**: Navigate to `/admin/collections/<slug>` — verify table headers, row count, sort controls
- **Payload Edit Forms**: Navigate to `/admin/collections/<slug>/:id` — verify all fields render, save button works
- **Relationship Fields**: Verify linked documents load and display correctly (e.g., course field in lesson form shows course title)
- **Media Field**: Verify uploaded images display with alt text

### Frontend Components

- **Note Editor**: Navigate to `/notes/create` or `/notes/edit/:id` — verify title, content, tags fields; save persists data
- **Dashboard**: Navigate to `/dashboard` — verify role-appropriate content loads
- **Course Editor**: Navigate to `/instructor/courses/:id/edit` — verify course fields populate, changes save

## Common Test Scenarios

1. **Auth Flow**: Navigate to `/login`, submit credentials, verify redirect to `/dashboard`
2. **Admin CRUD**: Navigate to `/admin/collections/notes`, create new note, edit it, delete it
3. **Frontend Notes**: Create note at `/notes/create`, view at `/notes/:id`, edit at `/notes/edit/:id`, delete
4. **Role Access**: Login as different roles, verify `/admin` panel access (admin only)
5. **Quiz Submission**: Navigate to quiz, submit answers, verify grading result
6. **Course Search**: Call `/api/courses/search`, verify results filter by difficulty/tags

## Environment Setup

Required env vars before running `pnpm dev`:

```
DATABASE_URL=<postgresql-connection-string>
PAYLOAD_SECRET=<secret-key>
```

## Dev Server

- **Command**: `pnpm dev`
- **URL**: `http://localhost:3000`

## Rules

- Be SPECIFIC to this project — reference actual URLs, collection names, component names
- For admin panels (Payload CMS), include exact `/admin/collections/{slug}` paths
- Include visual assertions: "you should see X", "verify Y is visible"
- Include interaction tests: "click button X", "fill field Y"
- Keep under 200 lines total
