# QA Guide

## Quick Reference

- **Dev server:** `pnpm dev` at `http://localhost:3000`
- **Login page:** `/login`
- **Admin panel:** `/admin/:...segments?`

## Authentication

### Test Accounts

| Role  | Email                 | Password                 |
| ----- | --------------------- | ------------------------ |
| Admin | (env: QA_ADMIN_EMAIL) | (env: QA_ADMIN_PASSWORD) |
| User  | (env: QA_USER_EMAIL)  | (env: QA_USER_PASSWORD)  |

### Login Steps

1. Navigate to `/login`
2. Enter credentials from the test accounts table above
3. Submit the login form
4. Verify redirect to dashboard or home page

### Auth Files

- `src/auth/withAuth.ts` — JWT validation and RBAC wrapper
- `src/auth/jwt-service.ts` — JWT token handling
- `src/auth/auth-service.ts` — Authentication service
- `src/middleware/auth.ts` — Auth middleware

## Roles

- `admin`
- `Engineer`
- `CEO`
- `CTO`
- `Researcher`

## Navigation Map

### Admin Panel

| Path                               | Description                                                                                                                         |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `/admin/collections/assignments`   | Assignments collection — title, module, instructions, dueDate, maxScore, rubric, criterion, maxPoints, description                  |
| `/admin/collections/certificates`  | Certificates collection — student, course, issuedAt, certificateNumber, finalGrade                                                  |
| `/admin/collections/courses`       | Courses collection — title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label               |
| `/admin/collections/enrollments`   | Enrollments collection — student, course, enrolledAt, status, completedAt, completedLessons                                         |
| `/admin/collections/lessons`       | Lessons collection — title, course, module, order, type, content, videoUrl, estimatedMinutes                                        |
| `/admin/collections/media`         | Media collection — alt                                                                                                              |
| `/admin/collections/modules`       | Modules collection — title, course, order, description                                                                              |
| `/admin/collections/notifications` | Notifications collection — recipient, type, title, message, link, isRead                                                            |
| `/admin/collections/notes`         | Notes collection — title, content, tags                                                                                             |
| `/admin/collections/quiz-attempts` | QuizAttempts collection — user, quiz, score, passed, answers, questionIndex, answer, startedAt, completedAt                         |
| `/admin/collections/quizzes`       | Quizzes collection — title, module, order, passingScore, timeLimit, maxAttempts, questions, text, type, options                     |
| `/admin/collections/submissions`   | Submissions collection — assignment, student, content, attachments, file, submittedAt, status, grade, feedback, rubricScores        |
| `/admin/collections/users`         | Users collection — firstName, lastName, displayName, avatar, bio, role, organization, refreshToken, tokenExpiresAt, lastTokenUsedAt |

### Frontend Pages

| Path                           | Expected Content   | Key Interactions                            |
| ------------------------------ | ------------------ | ------------------------------------------- |
| `/`                            | Home page          | Verify navigation links visible             |
| `/dashboard`                   | User dashboard     | Verify enrolled courses, recent activity    |
| `/instructor/courses/:id/edit` | Course editor      | Edit course details, manage modules/lessons |
| `/notes`                       | Notes list         | Create, view, edit notes                    |
| `/notes/:id`                   | Single note view   | View note content                           |
| `/notes/create`                | Note creation form | Fill title, content, tags                   |
| `/notes/edit/:id`              | Note edit form     | Modify existing note                        |

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

### Admin Components

- **CourseLessonsSorter** — Drag-sortable lessons grouped by chapter on course edit page
- **Payload Admin UI** — Standard Payload CMS form components for all collections
- Navigate to `/admin/collections/{slug}` for each collection's list view
- Click row to edit, use "Create" button to add new entries

### Frontend Components

- **Auth forms** — Login at `/login`, form validation on submit
- **Dashboard cards** — Enrolled courses displayed as cards with progress
- **Note editor** — Rich text or markdown input at `/notes/create` and `/notes/edit/:id`

## Common Test Scenarios

1. **Login flow** — Navigate to `/login`, submit credentials, verify redirect to `/dashboard`
2. **Course enrollment** — Login as student, browse courses, enroll in a course
3. **Note CRUD** — Create note at `/notes/create`, view at `/notes/:id`, edit at `/notes/edit/:id`, delete
4. **Quiz submission** — Navigate to quiz, answer questions, submit, verify score displayed
5. **Admin user management** — Login as admin, navigate to `/admin/collections/users`, create/edit user
6. **Assignment submission** — Student submits assignment, instructor grades via `/admin/collections/submissions`

## Environment Setup

Required environment variables:

- `DATABASE_URL` — PostgreSQL connection string
- `PAYLOAD_SECRET` — Secret for Payload CMS authentication

## Dev Server

- **Command:** `pnpm dev`
- **URL:** `http://localhost:3000`
