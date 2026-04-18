# QA Guide

## Quick Reference

- Dev server: `pnpm dev` at `http://localhost:3000`
- Login page: `/login`
- Admin panel: `/admin/:...segments?`

## Authentication

### Test Accounts

| Role  | Email          | Password          |
| ----- | -------------- | ----------------- |
| Admin | QA_ADMIN_EMAIL | QA_ADMIN_PASSWORD |
| User  | QA_USER_EMAIL  | QA_USER_PASSWORD  |

### Login Steps

1. Navigate to `/login`
2. Enter credentials from the test accounts table above
3. Submit the login form
4. Verify redirect to dashboard or home page

### Auth Files

- `src/auth/` — authentication utilities and withAuth HOC
- `src/utils/url-shortener.ts` — crypto utilities

## Roles

- `admin`
- `Engineer`
- `CEO`
- `CTO`
- `Researcher`

## Navigation Map

### Admin Panel

| Collection    | URL Path                           | Key Fields                                                                                          |
| ------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| Assignments   | `/admin/collections/assignments`   | title, module, instructions, dueDate, maxScore, rubric, criterion, maxPoints, description           |
| Certificates  | `/admin/collections/certificates`  | student, course, issuedAt, certificateNumber, finalGrade                                            |
| Courses       | `/admin/collections/courses`       | title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label    |
| Enrollments   | `/admin/collections/enrollments`   | student, course, enrolledAt, status, completedAt, completedLessons                                  |
| Lessons       | `/admin/collections/lessons`       | title, course, module, order, type, content, videoUrl, estimatedMinutes                             |
| Media         | `/admin/collections/media`         | alt                                                                                                 |
| Notes         | `/admin/collections/notes`         | title, content, tags                                                                                |
| Notifications | `/admin/collections/notifications` | recipient, type, title, message, link, isRead                                                       |
| Quiz Attempts | `/admin/collections/quiz-attempts` | user, quiz, score, passed, answers, questionIndex, answer, startedAt, completedAt                   |
| Quizzes       | `/admin/collections/quizzes`       | title, module, order, passingScore, timeLimit, maxAttempts, questions, text, type, options          |
| Submissions   | `/admin/collections/submissions`   | assignment, student, content, attachments, file, submittedAt, status, grade, feedback, rubricScores |
| Users         | `/admin/collections/users`         | firstName, lastName, displayName, avatar, bio, role, organization                                   |

### Frontend Pages

| Route                          | Expected Content   | Key Interactions     |
| ------------------------------ | ------------------ | -------------------- |
| `/`                            | Home page          | —                    |
| `/dashboard`                   | Dashboard          | —                    |
| `/instructor/courses/:id/edit` | Course editor      | Edit course fields   |
| `/notes`                       | Notes list         | Create, view notes   |
| `/notes/:id`                   | Note detail        | View/edit note       |
| `/notes/create`                | Note creation form | Create new note      |
| `/notes/edit/:id`              | Note edit form     | Update existing note |

### API Endpoints

| Path                         | Methods   | Purpose               |
| ---------------------------- | --------- | --------------------- |
| `/api/notes`                 | GET, POST | Note CRUD with search |
| `/api/quizzes/[id]`          | GET       | Quiz retrieval        |
| `/api/quizzes/[id]/submit`   | POST      | Quiz grading          |
| `/api/quizzes/[id]/attempts` | GET       | User's quiz attempts  |
| `/api/courses/search`        | GET       | Course search         |
| `/api/enroll`                | POST      | Enrollment            |
| `/api/gradebook/course/[id]` | GET       | Grades per course     |

## Component Verification Patterns

### Payload CMS Admin

- Navigate to `/admin/collections/{slug}` for each collection
- Verify list view shows expected columns
- Click a row to open edit form
- Verify all fields render correctly in forms

### Notes Feature

- `/notes` — verify notes list loads, search works
- `/notes/create` — verify form renders, creation succeeds
- `/notes/:id` — verify note content displays
- `/notes/edit/:id` — verify pre-populated form, update works

### Course Editor

- Navigate to `/instructor/courses/:id/edit`
- Verify CourseLessonsSorter component shows drag-sortable lessons grouped by chapter

## Common Test Scenarios

### Admin CRUD Workflow

1. Navigate to `/admin/collections/{collection}`
2. Click "Create" button
3. Fill required fields
4. Save and verify redirect to list
5. Verify new item appears in list

### Login Flow

1. Navigate to `/login`
2. Enter valid credentials → verify redirect to `/dashboard`
3. Enter invalid credentials → verify error message

### Note CRUD

1. Create note at `/notes/create`
2. View at `/notes/:id`
3. Edit at `/notes/edit/:id`
4. Verify changes persist

## Environment Setup

Required env vars:

- `DATABASE_URL` — PostgreSQL connection string
- `PAYLOAD_SECRET` — Payload CMS secret key

## Dev Server

- Command: `pnpm dev`
- URL: `http://localhost:3000`

## Rules

- Navigate to exact URL paths listed above
- Verify visual elements match expected content before interaction
- Use Playwright `expect()` assertions for visibility checks
- For admin panels, confirm form fields exist before filling
- Test drag interactions on CourseLessonsSorter component
- Verify role-based access by logging in with different test accounts
