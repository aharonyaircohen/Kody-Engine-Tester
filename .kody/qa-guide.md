# QA Guide

## Quick Reference

- **Dev server:** `pnpm dev` at `http://localhost:3000`
- **Login page:** `/login`
- **Admin panel:** `/admin/:...segments?`

## Authentication

### Test Accounts

| Role  | Email             | Password             |
| ----- | ----------------- | -------------------- |
| Admin | ${QA_ADMIN_EMAIL} | ${QA_ADMIN_PASSWORD} |
| User  | ${QA_USER_EMAIL}  | ${QA_USER_PASSWORD}  |

### Login Steps

1. Navigate to `/login`
2. Enter credentials from the test accounts table above
3. Submit the login form
4. Verify redirect to dashboard or home page

### Auth Files

- `src/auth/` — JWT authentication, `withAuth` HOC, role guards

## Roles

- `admin`
- `Engineer`
- `CEO`
- `CTO`
- `Researcher`

## Navigation Map

### Admin Panel

| Collection    | URL                                | Expected Elements                                                    |
| ------------- | ---------------------------------- | -------------------------------------------------------------------- |
| Assignments   | `/admin/collections/assignments`   | List view with title, module, dueDate, maxScore columns              |
| Courses       | `/admin/collections/courses`       | Grid/list toggle, title, slug, instructor, status, difficulty fields |
| Enrollments   | `/admin/collections/enrollments`   | Student, course, enrolledAt, status, completedLessons                |
| Lessons       | `/admin/collections/lessons`       | title, course, module, order, type (video/text), estimatedMinutes    |
| Media         | `/admin/collections/media`         | Upload area, alt text field                                          |
| Modules       | `/admin/collections/modules`       | title, course, order, description                                    |
| Notifications | `/admin/collections/notifications` | recipient, type, title, message, link, isRead toggle                 |
| Quiz Attempts | `/admin/collections/quiz-attempts` | user, quiz, score, passed, startedAt, completedAt                    |
| Quizzes       | `/admin/collections/quizzes`       | title, module, passingScore, timeLimit, maxAttempts, questions       |
| Submissions   | `/admin/collections/submissions`   | assignment, student, status, grade, feedback                         |
| Users         | `/admin/collections/users`         | firstName, lastName, displayName, role, organization                 |
| Certificates  | `/admin/collections/certificates`  | student, course, issuedAt, certificateNumber, finalGrade             |
| Notes         | `/admin/collections/notes`         | title, content, tags                                                 |

### Frontend Pages

| Path                           | Expected Content  | Key Interactions                         |
| ------------------------------ | ----------------- | ---------------------------------------- |
| `/`                            | Home/landing page | Navigation links, hero content           |
| `/dashboard`                   | User dashboard    | Course progress, recent activity         |
| `/instructor/courses/:id/edit` | Course editor     | Edit course details, add modules/lessons |
| `/notes`                       | Notes list        | Search, filter by tags                   |
| `/notes/:id`                   | Note detail view  | Display title, content, tags             |
| `/notes/create`                | Create note form  | Title, content, tags fields              |
| `/notes/edit/:id`              | Edit note form    | Pre-filled fields, save button           |

### API Endpoints

| Path                        | Methods          | Purpose                           |
| --------------------------- | ---------------- | --------------------------------- |
| `/api/notes`                | GET, POST        | Note CRUD with search             |
| `/api/notes/:id`            | GET, PUT, DELETE | Single note operations            |
| `/api/courses/search`       | GET              | Course search                     |
| `/api/enroll`               | POST             | Enrollment (requires viewer role) |
| `/api/gradebook/course/:id` | GET              | Grades per course (editor/admin)  |

## Component Verification Patterns

### Admin Collection List

- Navigate to `/admin/collections/{slug}`
- Verify table/list displays with correct columns
- Test pagination if available
- Verify search/filter functionality

### Admin Edit Form

- Click row or "Edit" button to open edit form
- Verify all fields render correctly
- Test save/cancel actions
- Verify validation errors appear for invalid input

### Frontend Forms

- `/notes/create` — fill title, content, tags; verify note appears in list
- `/notes/edit/:id` — pre-populated fields; modify and save; verify changes persist

## Common Test Scenarios

### Admin CRUD Workflow

1. Navigate to `/admin/collections/notes`
2. Click "Create New" button
3. Fill required fields (title, content)
4. Save and verify redirect to list
5. Verify new record appears in list

### Login Flow

1. Navigate to `/login`
2. Enter admin credentials
3. Verify redirect to `/dashboard`
4. Verify role-appropriate navigation appears

### Course Editing

1. Navigate to `/instructor/courses/:id/edit`
2. Modify course title or description
3. Add/remove modules
4. Save changes
5. Verify modifications persist

## Environment Setup

Required env vars:

- `DATABASE_URL` — PostgreSQL connection string
- `PAYLOAD_SECRET` — Payload CMS secret key

Optional for testing:

- `QA_ADMIN_EMAIL` — admin test account email
- `QA_ADMIN_PASSWORD` — admin test account password
- `QA_USER_EMAIL` — user test account email
- `QA_USER_PASSWORD` — user test account password

## Dev Server

- **Command:** `pnpm dev`
- **URL:** `http://localhost:3000`
