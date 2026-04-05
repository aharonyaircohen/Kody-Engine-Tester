# QA Guide

## Quick Reference

- Dev server command: `pnpm dev`
- Dev server URL: http://localhost:3000
- Login page URL: `/login`
- Admin panel URL: `/admin` (Payload CMS at `/admin/:...segments?`)

## Authentication

### Test Accounts

<!-- Fill in your test/preview environment credentials below -->

| Role  | Email             | Password  |
| ----- | ----------------- | --------- |
| Admin | admin@example.com | CHANGE_ME |
| User  | user@example.com  | CHANGE_ME |

### Login Steps

1. Navigate to `/login`
2. Enter credentials from the test accounts table above
3. Submit the login form
4. Verify redirect to dashboard or home page

### Auth Files

- `src/auth` — Auth service, JWT, withAuth HOC
- `src/middleware/auth-middleware.ts` — JWT authentication middleware
- `src/middleware/role-guard.ts` — RBAC (admin/instructor/student)
- `src/middleware/rate-limiter.ts` — Request rate limiting
- `src/middleware/csrf-middleware.ts` — CSRF protection
- `src/security/sanitizers.ts` — Input sanitization (sanitizeHtml, sanitizeSql, sanitizeUrl)

## Roles

- `admin`
- `Engineer`
- `CEO`
- `CTO`
- `Researcher`

## Navigation Map

### Admin Panel

| Collection    | URL Path                           | Key Fields                                                                                                       |
| ------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Assignments   | `/admin/collections/assignments`   | title, module, instructions, dueDate, maxScore, rubric, criterion, maxPoints, description                        |
| Courses       | `/admin/collections/courses`       | title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label                 |
| Enrollments   | `/admin/collections/enrollments`   | student, course, enrolledAt, status, completedAt, completedLessons                                               |
| Lessons       | `/admin/collections/lessons`       | title, course, module, order, type, content, videoUrl, estimatedMinutes                                          |
| Media         | `/admin/collections/media`         | alt                                                                                                              |
| Notifications | `/admin/collections/notifications` | recipient, type, title, message, link, isRead                                                                    |
| Quiz Attempts | `/admin/collections/quiz-attempts` | user, quiz, score, passed, answers, questionIndex, answer, startedAt, completedAt                                |
| Quizzes       | `/admin/collections/quizzes`       | title, module, order, passingScore, timeLimit, maxAttempts, questions, text, type, options                       |
| Submissions   | `/admin/collections/submissions`   | assignment, student, content, attachments, file, submittedAt, status, grade, feedback, rubricScores              |
| Users         | `/admin/collections/users`         | firstName, lastName, displayName, avatar, bio, role, organization, refreshToken, tokenExpiresAt, lastTokenUsedAt |
| Certificates  | `/admin/collections/certificates`  | student, course, issuedAt, certificateNumber, finalGrade                                                         |
| Notes         | `/admin/collections/notes`         | title, content, tags                                                                                             |

### Frontend Pages

| Route                          | Expected Content  | Key Interactions                      |
| ------------------------------ | ----------------- | ------------------------------------- |
| `/`                            | Home/landing page | Navigation links, course listings     |
| `/dashboard`                   | User dashboard    | View enrolled courses, progress       |
| `/instructor/courses/:id/edit` | Course editor     | Edit course details, modules, lessons |
| `/notes`                       | Notes list        | Search, filter notes                  |
| `/notes/create`                | Create note form  | Fill title, content, tags fields      |
| `/notes/:id`                   | Note detail view  | View note content                     |
| `/notes/edit/:id`              | Edit note form    | Modify and save note                  |

### API Endpoints

| Path                         | Methods            | Purpose                           |
| ---------------------------- | ------------------ | --------------------------------- |
| `/api/notes`                 | GET, POST          | Note CRUD with search             |
| `/api/notes/[id]`            | GET, POST          | Single note retrieval/update      |
| `/api/quizzes/[id]`          | GET                | Quiz retrieval                    |
| `/api/quizzes/[id]/submit`   | POST               | Quiz grading                      |
| `/api/quizzes/[id]/attempts` | GET                | User's quiz attempts              |
| `/api/courses/search`        | GET                | Course search with filtering      |
| `/api/enroll`                | POST               | Enrollment (viewer role required) |
| `/api/gradebook/course/[id]` | GET                | Grades per course (editor/admin)  |
| `/api/discussions`           | GET, POST          | Discussion posts                  |
| `/api/tasks`                 | POST               | Task creation                     |
| `/api/tasks/[id]`            | GET, PATCH, DELETE | Task CRUD                         |

## Component Verification Patterns

### Admin Components

- **CourseLessonsSorter** — Found at `/admin/collections/courses` edit view; drag-sortable lessons grouped by module
- **Payload CMS Admin** — Navigate via `/admin/collections/{slug}`; verify collection list views, create/edit forms, and delete confirmations

### Frontend Components

- **Note Editor** — Found at `/notes/create` and `/notes/edit/:id`; verify title, content, and tags fields render correctly
- **Course Card** — Displayed on `/` and `/dashboard`; verify thumbnail, title, instructor, and status indicators

## Common Test Scenarios

### Authentication Flow

1. Navigate to `/login` → verify login form renders
2. Submit invalid credentials → verify error message
3. Submit valid credentials → verify redirect to `/dashboard`
4. Logout → verify redirect to `/login`

### Course CRUD (Admin)

1. Navigate to `/admin/collections/courses`
2. Click "Create" → verify create form with all fields
3. Fill required fields (title, slug) → save
4. Verify new course appears in list
5. Click edit → modify fields → save → verify changes persist
6. Delete course → verify removal from list

### Note CRUD (Frontend)

1. Navigate to `/notes` → verify notes list
2. Click "Create Note" → navigate to `/notes/create`
3. Fill title, content, tags → save
4. Verify redirect to note detail at `/notes/:id`
5. Click "Edit" → navigate to `/notes/edit/:id`
6. Modify fields → save → verify changes
7. Verify note appears in `/notes` list

### Enrollment Flow

1. Navigate to `/dashboard` as logged-in user
2. Browse available courses
3. Click enroll on a course → verify enrollment success
4. Verify course appears in user's enrolled courses

## Environment Setup

Required env vars to start the dev server:

- `DATABASE_URL` — PostgreSQL connection string
- `PAYLOAD_SECRET` — Secret key for Payload CMS

## Dev Server

- Command: `pnpm dev`
- URL: http://localhost:3000

## Rules

- Be SPECIFIC to this project — reference actual URLs, collection names, component names
- For admin panels (Payload CMS), use exact `/admin/collections/{slug}` paths
- Include visual assertions: "you should see X", "verify Y is visible"
- Include interaction tests: "click button X", "fill field Y", "drag item Z"
- Keep under 200 lines total
