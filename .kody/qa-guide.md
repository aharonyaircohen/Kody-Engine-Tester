# QA Guide

## Quick Reference

- **Dev server command:** `pnpm dev`
- **Dev server URL:** `http://localhost:3000`
- **Login page URL:** `http://localhost:3000/login`
- **Admin panel URL:** `http://localhost:3000/admin/:...segments?`

## Authentication

### Test Accounts

| Role       | Email                 | Password                 |
| ---------- | --------------------- | ------------------------ |
| Admin      | `QA_ADMIN_EMAIL`      | `QA_ADMIN_PASSWORD`      |
| Engineer   | `QA_ENGINEER_EMAIL`   | `QA_ENGINEER_PASSWORD`   |
| CEO        | `QA_CEO_EMAIL`        | `QA_CEO_PASSWORD`        |
| CTO        | `QA_CTO_EMAIL`        | `QA_CTO_PASSWORD`        |
| Researcher | `QA_RESEARCHER_EMAIL` | `QA_RESEARCHER_PASSWORD` |

_(Set these environment variables before running tests)_

### Login Steps

1. Navigate to `/login`
2. Enter credentials from the test accounts table above
3. Submit the login form
4. Verify redirect to `/dashboard` or home page (`/`)

### Auth Files

- `src/auth/withAuth.ts` — JWT validation and RBAC HOC
- `src/auth/` — authentication utilities

## Navigation Map

### Admin Panel

#### Collections

| Collection    | URL                                | Key Fields                                                                                          |
| ------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| Assignments   | `/admin/collections/assignments`   | title, module, instructions, dueDate, maxScore, rubric, criterion, maxPoints, description           |
| Courses       | `/admin/collections/courses`       | title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label    |
| Enrollments   | `/admin/collections/enrollments`   | student, course, enrolledAt, status, completedAt, completedLessons                                  |
| Lessons       | `/admin/collections/lessons`       | title, course, module, order, type, content, videoUrl, estimatedMinutes                             |
| Media         | `/admin/collections/media`         | alt                                                                                                 |
| Modules       | `/admin/collections/modules`       | title, course, order, description                                                                   |
| Notifications | `/admin/collections/notifications` | recipient, type, title, message, link, isRead                                                       |
| Quiz Attempts | `/admin/collections/quiz-attempts` | user, quiz, score, passed, answers, questionIndex, answer, startedAt, completedAt                   |
| Quizzes       | `/admin/collections/quizzes`       | title, module, order, passingScore, timeLimit, maxAttempts, questions, text, type, options          |
| Submissions   | `/admin/collections/submissions`   | assignment, student, content, attachments, file, submittedAt, status, grade, feedback, rubricScores |
| Users         | `/admin/collections/users`         | firstName, lastName, displayName, avatar, bio, role, organization                                   |
| Certificates  | `/admin/collections/certificates`  | student, course, issuedAt, certificateNumber, finalGrade                                            |
| Notes         | `/admin/collections/notes`         | title, content, tags                                                                                |

### Frontend Pages

| Route                          | Purpose        | Key Interactions                      |
| ------------------------------ | -------------- | ------------------------------------- |
| `/`                            | Home page      | Landing content, navigation           |
| `/dashboard`                   | User dashboard | View enrolled courses, progress       |
| `/instructor/courses/:id/edit` | Course editor  | Edit course details, lessons, modules |
| `/notes`                       | Notes list     | List all notes                        |
| `/notes/:id`                   | Note detail    | View single note                      |
| `/notes/create`                | Create note    | Form to create new note               |
| `/notes/edit/:id`              | Edit note      | Form to edit existing note            |

### API Endpoints

| Endpoint                    | Methods   | Purpose                                                        |
| --------------------------- | --------- | -------------------------------------------------------------- |
| `/api/notes`                | GET, POST | Note CRUD with search                                          |
| `/api/notes/:id`            | GET, POST | Single note operations                                         |
| `/api/quizzes/:id`          | GET       | Quiz retrieval                                                 |
| `/api/quizzes/:id/submit`   | POST      | Quiz grading                                                   |
| `/api/quizzes/:id/attempts` | GET       | User's quiz attempts                                           |
| `/api/courses/search`       | GET       | Course search (params: q, difficulty, tags, sort, page, limit) |
| `/api/enroll`               | POST      | Enrollment (viewer role required)                              |
| `/api/gradebook/course/:id` | GET       | Grades per course (editor/admin)                               |

## Component Verification Patterns

### Admin Collection Forms

- Navigate to `/admin/collections/{slug}` to list items
- Click "Create" button to add new items
- Click row to edit existing items
- Verify form fields match collection schema
- Save and verify redirect to list view

### Frontend Notes

- `/notes` — Verify notes list renders with title/content preview
- `/notes/create` — Verify form with title, content, tags fields
- `/notes/:id` — Verify full note content displays
- `/notes/edit/:id` — Verify pre-filled form loads

### Dashboard

- Verify enrolled courses display with progress indicators
- Verify user role-based content visibility

## Common Test Scenarios

1. **Login Flow:** Navigate to `/login` → Submit credentials → Verify redirect to `/dashboard`
2. **Create Note:** Login → Navigate to `/notes/create` → Fill form → Save → Verify appears in `/notes` list
3. **Edit Note:** Login → Navigate to `/notes` → Click existing note → Edit content → Save → Verify changes
4. **Admin CRUD:** Login as admin → Navigate to `/admin/collections/notes` → Create/Edit/Delete items
5. **Course Enrollment:** Login as viewer role → Navigate to `/dashboard` → Verify enrollment options
6. **Quiz Submission:** Login → Navigate to quiz → Answer questions → Submit → Verify score display

## Environment Setup

Required environment variables:

- `DATABASE_URL` — PostgreSQL connection string
- `PAYLOAD_SECRET` — Payload CMS secret key
- `QA_ADMIN_EMAIL` / `QA_ADMIN_PASSWORD` — Admin test credentials
- `QA_ENGINEER_EMAIL` / `QA_ENGINEER_PASSWORD` — Engineer test credentials
- `QA_CEO_EMAIL` / `QA_CEO_PASSWORD` — CEO test credentials
- `QA_CTO_EMAIL` / `QA_CTO_PASSWORD` — CTO test credentials
- `QA_RESEARCHER_EMAIL` / `QA_RESEARCHER_PASSWORD` — Researcher test credentials

## Dev Server

- **Command:** `pnpm dev`
- **URL:** `http://localhost:3000`

## Rules

- Use Playwright `page.goto('http://localhost:3000/...')` with absolute URLs
- Verify elements are visible before interacting: `await expect(page.locator('selector')).toBeVisible()`
- Use `page.fill()` for text inputs, `page.click()` for buttons/links
- After form submissions, wait for navigation or API response
- Test as different roles by logging in with each test account
- Admin routes require admin role authentication
- Frontend routes require appropriate role-based access
