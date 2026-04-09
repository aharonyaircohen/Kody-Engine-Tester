# QA Guide

## Quick Reference

- **Dev server:** `pnpm dev` → http://localhost:3000
- **Login:** http://localhost:3000/login
- **Admin panel:** http://localhost:3000/admin

## Authentication

### Test Accounts

| Role       | Email             | Password       |
| ---------- | ----------------- | -------------- |
| Admin      | admin@example.com | CHANGE_ME      |
| Engineer   | user@example.com  | CHANGE_ME      |
| CEO        | (add email)       | (add password) |
| CTO        | (add email)       | (add password) |
| Researcher | (add email)       | (add password) |

### Login Steps

1. Navigate to `/login`
2. Enter email and password from the test accounts table
3. Click the submit button
4. Verify redirect to `/dashboard`

### Auth Files

- `src/auth/withAuth.ts` — JWT validation HOC
- `src/auth/AuthService.ts` — authentication logic
- `src/auth/JwtService.ts` — Web Crypto API JWT handling
- `src/middleware/` — validation middleware

## Navigation Map

### Admin Panel

| Path                               | What to Expect                   | Key Fields / Interactions                                                                           |
| ---------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------- |
| `/admin`                           | Payload CMS admin shell          | Collection sidebar navigation                                                                       |
| `/admin/collections/assignments`   | Assignments list + create button | title, module, instructions, dueDate, maxScore, rubric, criterion, maxPoints, description           |
| `/admin/collections/courses`       | Courses list + create button     | title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label    |
| `/admin/collections/enrollments`   | Enrollments list                 | student, course, enrolledAt, status, completedAt, completedLessons                                  |
| `/admin/collections/lessons`       | Lessons list                     | title, course, module, order, type, content, videoUrl, estimatedMinutes                             |
| `/admin/collections/media`         | Media upload area                | alt                                                                                                 |
| `/admin/collections/notifications` | Notifications list               | recipient, type, title, message, link, isRead                                                       |
| `/admin/collections/quiz-attempts` | Quiz attempts                    | user, quiz, score, passed, answers, questionIndex, answer, startedAt, completedAt                   |
| `/admin/collections/quizzes`       | Quizzes list                     | title, module, order, passingScore, timeLimit, maxAttempts, questions, text, type, options          |
| `/admin/collections/submissions`   | Submissions list                 | assignment, student, content, attachments, file, submittedAt, status, grade, feedback, rubricScores |
| `/admin/collections/users`         | Users list                       | firstName, lastName, displayName, avatar, bio, role, organization                                   |
| `/admin/collections/certificates`  | Certificates list                | student, course, issuedAt, certificateNumber, finalGrade                                            |
| `/admin/collections/notes`         | Notes list                       | title, content, tags                                                                                |

### Frontend Pages

| Path                           | Expected Content   | Key Interactions                   |
| ------------------------------ | ------------------ | ---------------------------------- |
| `/`                            | Home/landing page  | Navigation links, hero content     |
| `/dashboard`                   | User dashboard     | Enrollment status, recent activity |
| `/instructor/courses/:id/edit` | Course editor      | Edit course fields, save/discard   |
| `/notes`                       | Notes list view    | Search, filter, create note button |
| `/notes/:id`                   | Single note view   | Note content display               |
| `/notes/create`                | Note creation form | title, content, tags fields        |
| `/notes/edit/:id`              | Note edit form     | Pre-filled fields, save button     |

### API Endpoints

| Path                         | Methods   | Purpose                           |
| ---------------------------- | --------- | --------------------------------- |
| `/api/notes`                 | GET, POST | Note CRUD with search             |
| `/api/notes/[id]`            | GET       | Single note retrieval             |
| `/api/quizzes/[id]`          | GET       | Quiz retrieval                    |
| `/api/quizzes/[id]/submit`   | POST      | Quiz grading                      |
| `/api/quizzes/[id]/attempts` | GET       | User's quiz attempts              |
| `/api/courses/search`        | GET       | Course search                     |
| `/api/enroll`                | POST      | Enrollment (viewer role required) |
| `/api/gradebook/course/[id]` | GET       | Grades per course (editor/admin)  |

## Component Verification Patterns

- **Lexical rich text editor** — Used in note content fields; verify toolbar renders, text input works
- **Drag-sortable lists** — Course lessons can be reordered; drag handle visible, order persists after refresh
- **Media upload** — `/admin/collections/media`; verify thumbnail preview after upload
- **Role-based UI** — Admin vs viewer role sees different nav items; switch accounts to verify

## Common Test Scenarios

1. **Admin creates a course:** `/admin/collections/courses` → Create → Fill title, slug, description, assign instructor → Save → Verify appears in course list
2. **Student enrolls:** Login as Engineer → `/api/enroll` POST with course ID → Verify enrollment appears in `/admin/collections/enrollments`
3. **Note CRUD:** Login → `/notes/create` → Fill title/content → Save → Navigate to `/notes` → Verify note appears → Click note → Verify content matches
4. **Quiz submission:** Login → Attempt quiz at `/api/quizzes/[id]/submit` → Verify score returned
5. **Auth guard:** Logout → Attempt `/dashboard` → Verify redirect to `/login`

## Environment Setup

Required env vars before starting dev server:

- `DATABASE_URL` — PostgreSQL connection string
- `PAYLOAD_SECRET` — Secret for Payload CMS encryption

## Dev Server

- **Command:** `pnpm dev`
- **URL:** http://localhost:3000

## Roles

- `admin`
- `Engineer`
- `CEO`
- `CTO`
- `Researcher`
