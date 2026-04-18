# QA Guide

## Quick Reference

- **Dev server:** `pnpm dev` at `http://localhost:3000`
- **Login page:** `/login`
- **Admin panel:** `/admin` (Payload CMS)

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

- `src/auth/` — JWT service, auth service, session store, withAuth decorator

## Roles

- `admin`
- `Engineer`
- `CEO`
- `CTO`
- `Researcher`

## Navigation Map

### Frontend Pages

| Path                           | Expected Content   | Key Interactions                 |
| ------------------------------ | ------------------ | -------------------------------- |
| `/`                            | Homepage           | —                                |
| `/dashboard`                   | User dashboard     | —                                |
| `/instructor/courses/:id/edit` | Course editor      | Edit course details, add modules |
| `/notes`                       | Notes list         | Create, edit, delete notes       |
| `/notes/:id`                   | Single note view   | View note content                |
| `/notes/create`                | Note creation form | Fill title, content, tags        |
| `/notes/edit/:id`              | Note edit form     | Modify existing note             |

### Admin Panel — Collections

| Path                               | Name          | Key Fields                                        |
| ---------------------------------- | ------------- | ------------------------------------------------- |
| `/admin/collections/assignments`   | Assignments   | title, module, instructions, dueDate, maxScore    |
| `/admin/collections/courses`       | Courses       | title, slug, description, instructor, status      |
| `/admin/collections/enrollments`   | Enrollments   | student, course, enrolledAt, status               |
| `/admin/collections/lessons`       | Lessons       | title, course, module, order, type, content       |
| `/admin/collections/media`         | Media         | alt                                               |
| `/admin/collections/modules`       | Modules       | title, course, order, description                 |
| `/admin/collections/notifications` | Notifications | recipient, type, title, message, isRead           |
| `/admin/collections/quiz-attempts` | QuizAttempts  | user, quiz, score, passed, startedAt              |
| `/admin/collections/quizzes`       | Quizzes       | title, module, passingScore, timeLimit, questions |
| `/admin/collections/submissions`   | Submissions   | assignment, student, status, grade, feedback      |
| `/admin/collections/users`         | Users         | firstName, lastName, role, organization           |
| `/admin/collections/certificates`  | Certificates  | student, course, issuedAt, certificateNumber      |
| `/admin/collections/notes`         | Notes         | title, content, tags                              |

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
| `/api/gradebook/course/[id]` | GET       | Grades per course                 |

## Component Verification Patterns

### Admin Collection List View

Navigate to `/admin/collections/{slug}` — verify table renders with columns, pagination controls visible.

### Admin Collection Edit Form

Navigate to `/admin/collections/{slug}/.../edit` — verify form fields match collection schema; save button triggers success toast.

### Notes CRUD

1. Create: Navigate `/notes/create`, fill title/content/tags, submit, verify redirect to note view
2. Read: Navigate `/notes` or `/notes/:id`, verify content renders
3. Update: Navigate `/notes/edit/:id`, modify fields, save, verify changes persist
4. Delete: From list or edit view, trigger delete, confirm removal from list

### Course Edit (Instructor)

Navigate `/instructor/courses/:id/edit` — verify title, description, thumbnail fields editable; drag-sortable modules/lessons if present.

## Common Test Scenarios

### Admin Login Flow

1. Go to `/admin`
2. If not logged in, redirect to `/login`
3. Enter admin credentials
4. Verify redirect to `/admin` dashboard with collections sidebar

### Student Enrollment Flow

1. Login as student role
2. Navigate to course catalog
3. Click enroll on a course
4. Verify enrollment appears in `/dashboard`

### Quiz Submission Flow

1. Login as student
2. Navigate to a quiz
3. Answer questions
4. Submit quiz
5. Verify score displayed and passed/failed indicator

### Note CRUD Flow

1. Login
2. Go to `/notes/create`
3. Create note with title "Test Note", content, tags
4. Save, verify redirects to `/notes/:id`
5. Edit note, change title to "Updated Note"
6. Delete note, verify removal from `/notes`

## Environment Setup

Required env vars to start dev server:

- `DATABASE_URL` — PostgreSQL connection string
- `PAYLOAD_SECRET` — Secret for Payload CMS

## Dev Server

- **Command:** `pnpm dev`
- **URL:** `http://localhost:3000`

## Rules

- Be **specific** to this project — reference actual URLs, collection names, component names
- For admin panels (Payload CMS), use exact `/admin/collections/{slug}` paths
- Include visual assertions: "you should see X", "verify Y is visible"
- Include interaction tests: "click button X", "fill field Y", "drag item Z"
- Keep under 200 lines total
