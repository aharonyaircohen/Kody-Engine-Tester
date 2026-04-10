# QA Guide

## Quick Reference

- **Dev Server:** `pnpm dev` at `http://localhost:3000`
- **Login Page:** `/login`
- **Admin Panel:** `/admin` (Payload CMS at `/admin/collections/:slug`)

## Authentication

### Test Accounts

| Role  | Email               | Password               |
| ----- | ------------------- | ---------------------- |
| Admin | `${QA_ADMIN_EMAIL}` | `${QA_ADMIN_PASSWORD}` |
| User  | `${QA_USER_EMAIL}`  | `${QA_USER_PASSWORD}`  |

> **Note:** Set these environment variables in `.env.local` or your CI/test environment before running tests. See `.env.example` for the full list.

### Login Steps

1. Navigate to `/login`
2. Enter email from test accounts table above
3. Enter password
4. Click the submit button
5. Verify redirect to `/dashboard`

### Auth Files

- `src/auth/withAuth.ts` — route protection HOC
- `src/auth/AuthContext.tsx` — auth state context
- `src/auth/JwtService.ts` — JWT handling
- `src/auth/userStore.ts` — in-memory user store

## Roles

The system supports these roles: `admin`, `Engineer`, `CEO`, `CTO`, `Researcher`

## Navigation Map

### Admin Panel

| Collection    | URL                                | Key Fields                                                                                          | Expected Content                                 |
| ------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Assignments   | `/admin/collections/assignments`   | title, module, instructions, dueDate, maxScore, rubric, criterion, maxPoints, description           | List view with create/edit forms                 |
| Courses       | `/admin/collections/courses`       | title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label    | Course editor with CourseLessonsSorter component |
| Enrollments   | `/admin/collections/enrollments`   | student, course, enrolledAt, status, completedAt, completedLessons                                  | Enrollment records grid                          |
| Lessons       | `/admin/collections/lessons`       | title, course, module, order, type, content, videoUrl, estimatedMinutes                             | Lesson list with drag-reorder                    |
| Media         | `/admin/collections/media`         | alt                                                                                                 | Media upload/management                          |
| Modules       | `/admin/collections/modules`       | title, course, order, description                                                                   | Module editor                                    |
| Notifications | `/admin/collections/notifications` | recipient, type, title, message, link, isRead                                                       | Notification list                                |
| Quiz Attempts | `/admin/collections/quiz-attempts` | user, quiz, score, passed, answers, questionIndex, answer, startedAt, completedAt                   | Attempt history                                  |
| Quizzes       | `/admin/collections/quizzes`       | title, module, order, passingScore, timeLimit, maxAttempts, questions, text, type, options          | Quiz builder                                     |
| Submissions   | `/admin/collections/submissions`   | assignment, student, content, attachments, file, submittedAt, status, grade, feedback, rubricScores | Submission grader                                |
| Users         | `/admin/collections/users`         | firstName, lastName, displayName, avatar, bio, role, organization                                   | User management                                  |
| Certificates  | `/admin/collections/certificates`  | student, course, issuedAt, certificateNumber, finalGrade                                            | Certificate issuer                               |
| Notes         | `/admin/collections/notes`         | title, content, tags                                                                                | Notes editor                                     |

### Frontend Pages

| Route                          | Expected Content                                      | Key Interactions                  |
| ------------------------------ | ----------------------------------------------------- | --------------------------------- |
| `/`                            | Home/landing page                                     | Navigation, hero content          |
| `/dashboard`                   | User dashboard with enrolled courses, recent activity | Course cards, progress indicators |
| `/instructor/courses/:id/edit` | Course editor with lessons sorter                     | Drag-drop reorder, save/cancel    |
| `/notes`                       | Notes list view                                       | Search, filter by tags            |
| `/notes/:id`                   | Single note view                                      | Edit button, delete               |
| `/notes/create`                | Note creation form                                    | Title, content, tags fields       |
| `/notes/edit/:id`              | Note edit form                                        | Pre-filled fields, save           |

### API Endpoints

| Path                        | Methods   | Purpose                               |
| --------------------------- | --------- | ------------------------------------- |
| `/api/notes`                | GET, POST | Note CRUD with search                 |
| `/api/notes/:id`            | GET       | Single note retrieval                 |
| `/api/quizzes/:id`          | GET       | Quiz retrieval                        |
| `/api/quizzes/:id/submit`   | POST      | Quiz grading                          |
| `/api/quizzes/:id/attempts` | GET       | User's quiz attempts                  |
| `/api/courses/search`       | GET       | Course search via CourseSearchService |
| `/api/enroll`               | POST      | Enrollment (requires viewer role)     |
| `/api/gradebook/course/:id` | GET       | Grades per course (editor/admin)      |
| `/api/health`               | GET       | Health check                          |

## Component Verification Patterns

### CourseLessonsSorter

- **Location:** `/instructor/courses/:id/edit`
- **Visual:** Drag-sortable list of lessons grouped by chapter/module
- **Interaction:** Drag lesson rows to reorder; visual drop indicator

### PasswordStrengthBar

- **Location:** Registration/password change forms
- **Visual:** Strength meter with colored segments
- **Assertion:** Strength increases as password complexity grows

### ProtectedRoute

- **Location:** Wraps dashboard and instructor pages
- **Visual:** Redirects to `/login` when unauthenticated
- **Interaction:** Unauth user visits `/dashboard` → redirected to login

### ModuleList (drag-drop)

- **Location:** Course module editor
- **Visual:** Ordered list with drag handles
- **Interaction:** Drag to reorder; `dataTransfer.setData/getData` on drop

## Common Test Scenarios

### Auth Flow

1. Navigate to `/login` as unauthenticated user
2. Fill email + password
3. Submit → verify redirect to `/dashboard`
4. Logout → verify `/login` accessible, `/dashboard` redirects

### Course CRUD (Admin)

1. Navigate to `/admin/collections/courses`
2. Click "Create" → fill title, slug, description
3. Save → verify appears in list
4. Edit → modify title → save
5. Verify changes persist

### Note Creation (Frontend)

1. Login as any role
2. Navigate to `/notes/create`
3. Fill title, content, tags
4. Save → verify redirect to `/notes/:id`
5. Note visible in `/notes` list

### Enrollment Flow

1. Login as student
2. Browse courses
3. Click enroll → verify `/api/enroll` called
4. Course appears in `/dashboard`

### Quiz Submission

1. Navigate to quiz from course
2. Answer questions
3. Submit → verify `/api/quizzes/:id/submit`
4. Score displayed, attempt recorded in `/admin/collections/quiz-attempts`

## Environment Setup

Required environment variables:

```bash
DATABASE_URL=postgresql://...
PAYLOAD_SECRET=<random-32-char-secret>
QA_ADMIN_EMAIL=admin@example.com
QA_ADMIN_PASSWORD=...
QA_USER_EMAIL=user@example.com
QA_USER_PASSWORD=...
```

## Dev Server

```bash
pnpm dev
# Runs at http://localhost:3000
```

## Rules

- **Use env vars for credentials** — never hardcode test passwords in code or docs
- **Visual assertions first** — verify elements are visible before interacting
- **Login before protected routes** — ensure session is authenticated
- **Admin routes require admin role** — verify role check in `withAuth`
- **Drag-drop tests** — use `dataTransfer.setData` for React drag events
- **Wait for hydration** — use `page.waitForLoadState('networkidle')` on admin pages
- **Playwright `forbidOnly: true`** — CI will fail on `.only()` left in tests
