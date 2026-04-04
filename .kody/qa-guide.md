# QA Guide

## Quick Reference

- **Dev server**: `pnpm dev` at `http://localhost:3000`
- **Login page**: `http://localhost:3000/admin/login` (Payload admin) or `http://localhost:3000/api/auth/login` (API)
- **Admin panel**: `http://localhost:3000/admin`

## Authentication

### Test Accounts

Use env vars — set in `.env.local`:
| Role | Email Env Var | Password Env Var |
|------|---------------|------------------|
| admin | `QA_ADMIN_EMAIL` | `QA_ADMIN_PASSWORD` |
| instructor | `QA_INSTRUCTOR_EMAIL` | `QA_INSTRUCTOR_PASSWORD` |
| student | `QA_STUDENT_EMAIL` | `QA_STUDENT_PASSWORD` |

### Login Steps

1. Navigate to `http://localhost:3000/admin/login`
2. Fill `email` and `password` fields
3. Click **Login** button
4. Verify redirect to `http://localhost:3000/admin` (dashboard)

### Auth Files

- `src/auth/auth-service.ts` — JWT auth with refresh token rotation
- `src/auth/jwt-service.ts` — Web Crypto API JWT operations, in-memory blacklist
- `src/auth/withAuth.ts` — HOC for route protection with RBAC
- `src/auth/session-store.ts` — In-memory session management
- `src/auth/user-store.ts` — In-memory user storage with SHA-256 hashing
- `src/api/auth/login.ts` — Login endpoint handler

## Navigation Map

### Admin Panel

| URL                                 | What to Expect                                                                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `/admin`                            | Dashboard with sidebar nav, user info top-right                                                                                            |
| `/admin/collections/users`          | Users list table with firstName, lastName, email, role columns                                                                             |
| `/admin/collections/courses`        | Courses list with title, slug, instructor, status columns                                                                                  |
| `/admin/collections/courses/create` | Course edit form: title, slug, description, thumbnail, instructor (relationship), status (select), difficulty, estimatedHours, tags, label |
| `/admin/collections/courses/[id]`   | Course edit form with same fields as create                                                                                                |
| `/admin/collections/lessons`        | Lessons list with title, course (rel), module, order, type columns                                                                         |
| `/admin/collections/lessons/[id]`   | Lesson edit form: title, course (rel), module, order, type (select), content, videoUrl, estimatedMinutes                                   |
| `/admin/collections/enrollments`    | Enrollments table: student, course, enrolledAt, status, completedAt                                                                        |
| `/admin/collections/quizzes`        | Quizzes table: title, module, order, passingScore, timeLimit, maxAttempts                                                                  |
| `/admin/collections/assignments`    | Assignments table: title, module, dueDate, maxScore                                                                                        |
| `/admin/collections/notes`          | Notes table: title, content, tags                                                                                                          |
| `/admin/collections/media`          | Media list with alt text, thumbnail preview                                                                                                |
| `/admin/collections/notifications`  | Notifications table: recipient, type, title, isRead                                                                                        |
| `/admin/collections/submissions`    | Submissions table: assignment, student, status, grade                                                                                      |
| `/admin/collections/quiz-attempts`  | Quiz attempts: user, quiz, score, passed                                                                                                   |
| `/admin/collections/certificates`   | Certificates: student, course, issuedAt, certificateNumber, finalGrade                                                                     |

### Frontend Pages

| URL                             | Expected Content                 | Key Interactions                                                        |
| ------------------------------- | -------------------------------- | ----------------------------------------------------------------------- |
| `/`                             | Public landing page              | —                                                                       |
| `/dashboard`                    | Role-specific dashboard with nav | —                                                                       |
| `/notes`                        | Notes list                       | Create note button → `/notes/create`                                    |
| `/notes/create`                 | Note creation form               | Fill title, content, tags; click Save                                   |
| `/notes/[id]`                   | Note detail view                 | Edit button → `/notes/edit/[id]`                                        |
| `/notes/edit/[id]`              | Note edit form                   | Modify fields, click Save                                               |
| `/instructor/courses/[id]/edit` | Course editor                    | Custom CourseLessonsSorter component (drag-sortable lessons by chapter) |

### API Endpoints

| Path                         | Methods   | Purpose                                 |
| ---------------------------- | --------- | --------------------------------------- |
| `/api/auth/login`            | POST      | Authenticate user, return JWT           |
| `/api/auth/profile`          | GET, POST | User profile management                 |
| `/api/notes`                 | GET, POST | Note CRUD with search                   |
| `/api/courses/search`        | GET       | Course search via `CourseSearchService` |
| `/api/enroll`                | POST      | Enrollment (viewer role required)       |
| `/api/quizzes/[id]`          | GET       | Quiz retrieval                          |
| `/api/quizzes/[id]/submit`   | POST      | Quiz grading via `QuizGrader`           |
| `/api/quizzes/[id]/attempts` | GET       | User's quiz attempts                    |
| `/api/gradebook/course/[id]` | GET       | Grades per course (editor/admin)        |

## Component Verification Patterns

### CourseLessonsSorter

- **Location**: `/instructor/courses/[id]/edit`
- **What to verify**: Drag handles on lesson items, chapter grouping headers, order numbers update on drop
- **Interaction test**: Drag lesson from Chapter 1 to Chapter 2, verify order persists after page reload

### Lesson Type Selector

- **Location**: `/admin/collections/lessons/[id]` form
- **What to verify**: Type dropdown with options (video, text, quiz), conditional fields appear based on selection
- **Interaction test**: Select "video" type → verify `videoUrl` field appears; select "quiz" → verify quiz selector appears

### Notes Editor

- **Location**: `/notes/create`, `/notes/edit/[id]`
- **What to verify**: Title input, content textarea, tags input (comma-separated)
- **Interaction test**: Create note, navigate to list, verify note appears with correct title

## Common Test Scenarios

### Login Flow

1. Navigate to `/admin/login`
2. Enter valid credentials → verify dashboard loads
3. Enter invalid credentials → verify error message displayed

### Course CRUD

1. Go to `/admin/collections/courses/create`
2. Fill required fields (title, slug), set status, save
3. Verify redirect to list with new course visible
4. Click course → edit title → save
5. Verify changes reflected in list view

### Lesson Ordering

1. Open `/instructor/courses/[id]/edit`
2. Verify lessons grouped by module/chapter
3. Drag lesson to new position within chapter
4. Reload page → verify order persists

### Note Creation

1. Login as any role
2. Navigate to `/notes`
3. Click **Create Note**
4. Fill title, content, tags
5. Save → verify redirect to `/notes/[newId]` with content displayed

## Environment Setup

Required in `.env.local`:

```env
DATABASE_URL=postgres://user:password@localhost:5432/learnhub
PAYLOAD_SECRET=your-secret-here
```

Optional for testing:

```env
QA_ADMIN_EMAIL=admin@example.com
QA_ADMIN_PASSWORD=password
QA_INSTRUCTOR_EMAIL=instructor@example.com
QA_INSTRUCTOR_PASSWORD=password
QA_STUDENT_EMAIL=student@example.com
QA_STUDENT_PASSWORD=password
```

## Dev Server

```bash
pnpm dev
# Server runs at http://localhost:3000
```
