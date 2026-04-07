# QA Guide

## Quick Reference

- **Dev server command:** `pnpm dev`
- **Dev server URL:** http://localhost:3000
- **Login page URL:** http://localhost:3000/login
- **Admin panel URL:** http://localhost:3000/admin

## Authentication

### Test Accounts

| Role       | Email                    | Password                    |
| ---------- | ------------------------ | --------------------------- |
| Admin      | `${QA_ADMIN_EMAIL}`      | `${QA_ADMIN_PASSWORD}`      |
| Engineer   | `${QA_ENGINEER_EMAIL}`   | `${QA_ENGINEER_PASSWORD}`   |
| CEO        | `${QA_CEO_EMAIL}`        | `${QA_CEO_PASSWORD}`        |
| CTO        | `${QA_CTO_EMAIL}`        | `${QA_CTO_PASSWORD}`        |
| Researcher | `${QA_RESEARCHER_EMAIL}` | `${QA_RESEARCHER_PASSWORD}` |

### Login Steps

1. Navigate to `/login`
2. Enter credentials from the test accounts table above
3. Submit the login form
4. Verify redirect to `/dashboard` or home page `/`

### Auth Files

- `src/auth/withAuth.ts` — JWT auth HOC
- `src/auth/extractBearerToken.ts` — token extraction
- `src/auth/checkRole.ts` — RBAC utility
- `src/auth/userStore.ts` — in-memory user store
- `src/auth/sessionStore.ts` — session management
- `src/auth/jwtService.ts` — JWT operations

## Roles

- `admin`
- `Engineer`
- `CEO`
- `CTO`
- `Researcher`

## Navigation Map

### Admin Panel

#### Collections Index

- **URL:** `/admin/collections`
- **Elements:** Grid of collection tiles (Assignments, Courses, Enrollments, Lessons, Media, Modules, Notifications, QuizAttempts, Quizzes, Submissions, Users, Certificates, Notes)

#### `/admin/collections/assignments`

- **Elements:** Assignment list table with title, module, dueDate, maxScore columns
- **Form fields:** title, module (relation), instructions, dueDate, maxScore, rubric, criterion, maxPoints, description

#### `/admin/collections/courses`

- **Elements:** Course list with title, slug, instructor, status, difficulty columns
- **Form fields:** title, slug, description, thumbnail (media), instructor (relation), status, difficulty, estimatedHours, tags, label

#### `/admin/collections/enrollments`

- **Elements:** Enrollment list with student, course, enrolledAt, status columns
- **Form fields:** student (relation), course (relation), enrolledAt, status, completedAt, completedLessons

#### `/admin/collections/lessons`

- **Elements:** Lesson list with title, course, module, order, type columns
- **Form fields:** title, course (relation), module (relation), order, type, content, videoUrl, estimatedMinutes

#### `/admin/collections/media`

- **Elements:** Media list with thumbnail preview, alt text
- **Form fields:** alt

#### `/admin/collections/modules`

- **Elements:** Module list with title, course, order columns
- **Form fields:** title, course (relation), order, description

#### `/admin/collections/notifications`

- **Elements:** Notification list with recipient, type, title, isRead columns
- **Form fields:** recipient (relation), type, title, message, link, isRead

#### `/admin/collections/quiz-attempts`

- **Elements:** Quiz attempt list with user, quiz, score, passed columns
- **Form fields:** user (relation), quiz (relation), score, passed, answers, questionIndex, answer, startedAt, completedAt

#### `/admin/collections/quizzes`

- **Elements:** Quiz list with title, module, order, passingScore columns
- **Form fields:** title, module (relation), order, passingScore, timeLimit, maxAttempts, questions, text, type, options, isCorrect, correctAnswer, points

#### `/admin/collections/submissions`

- **Elements:** Submission list with assignment, student, status, grade columns
- **Form fields:** assignment (relation), student (relation), content, attachments, file, submittedAt, status, grade, feedback, rubricScores, criterion, score, comment

#### `/admin/collections/users`

- **Elements:** User list with firstName, lastName, displayName, role, organization columns
- **Form fields:** firstName, lastName, displayName, avatar (media), bio, role, organization, refreshToken, tokenExpiresAt, lastTokenUsedAt

#### `/admin/collections/certificates`

- **Elements:** Certificate list with student, course, issuedAt, certificateNumber columns
- **Form fields:** student (relation), course (relation), issuedAt, certificateNumber, finalGrade

#### `/admin/collections/notes`

- **Elements:** Note list with title, tags columns
- **Form fields:** title, content, tags

### Frontend Pages

#### `/`

- **Elements:** Home page with course listings or landing content
- **Interactions:** Navigation links, course cards clickable

#### `/dashboard`

- **Elements:** User dashboard showing enrolled courses, recent activity, notifications
- **Interactions:** Course enrollment, navigation to courses, note access

#### `/instructor/courses/:id/edit`

- **Elements:** Course editor with title, slug, description, module sorter, lesson ordering
- **Interactions:** Edit course details, drag-sort modules/lessons, save changes

#### `/notes`

- **Elements:** Notes list view with search/filter
- **Interactions:** Click note to view, create new note, edit/delete existing

#### `/notes/:id`

- **Elements:** Note detail view with title, content, tags
- **Interactions:** Edit button, delete button, back navigation

#### `/notes/create`

- **Elements:** Note creation form with title, content, tags fields
- **Interactions:** Fill form, submit, verify redirect to note list

#### `/notes/edit/:id`

- **Elements:** Note edit form pre-populated with existing data
- **Interactions:** Modify fields, save, verify update

### API Endpoints

- `GET/POST /api/notes` — Note CRUD with search
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading
- `GET /api/quizzes/[id]/attempts` — User quiz attempts
- `GET /api/courses/search` — Course search
- `POST /api/enroll` — Enrollment (requires viewer role)
- `GET /api/gradebook/course/[id]` — Course grades (requires editor/admin)

## Component Verification Patterns

### Payload Admin Components

- **Collection lists:** Verify table headers match field names, rows are clickable for edit
- **Edit forms:** Verify all fields render, relations show as dropdowns/lookups, media shows preview
- **Custom fields:** Verify rubric/criterion fields render correctly in assignments/quizzes

### Frontend Components

- **Course cards:** Verify thumbnail, title, instructor name, difficulty badge visible
- **Note editor:** Verify title, content (rich text), tags input all functional
- **Drag-sort:** In course editor, verify modules/lessons can be reordered and order persists

## Common Test Scenarios

1. **Admin CRUD:** Navigate to collection → Create new entry → Edit entry → Delete entry → Verify list updates
2. **Course enrollment:** Login as student → Browse courses → Enroll → Verify dashboard shows enrolled course
3. **Note workflow:** Create note → View note → Edit note → Delete note → Verify removal from list
4. **Quiz flow:** Start quiz → Answer questions → Submit → Verify score and pass/fail
5. **Role access:** Login as each role → Verify correct navigation items and permissions
6. **Auth flow:** Login → Verify session → Logout → Verify redirect to login

## Environment Setup

Required environment variables:

- `DATABASE_URL` — PostgreSQL connection string
- `PAYLOAD_SECRET` — Secret for Payload CMS encryption

Optional for testing:

- `QA_ADMIN_EMAIL` — Admin login email (default: admin@example.com)
- `QA_ADMIN_PASSWORD` — Admin login password
- `QA_ENGINEER_EMAIL`, `QA_ENGINEER_PASSWORD`
- `QA_CEO_EMAIL`, `QA_CEO_PASSWORD`
- `QA_CTO_EMAIL`, `QA_CTO_PASSWORD`
- `QA_RESEARCHER_EMAIL`, `QA_RESEARCHER_PASSWORD`

## Dev Server

- **Command:** `pnpm dev`
- **URL:** http://localhost:3000
- **Payload admin:** http://localhost:3000/admin

## Rules

- Use Playwright `page.goto()` for navigation, `page.waitForSelector()` for assertions
- Verify elements are visible with `expect(page.locator('selector')).toBeVisible()`
- Use `page.fill()` for text inputs, `page.click()` for buttons/links
- For drag-sort tests, use `page.dragAndDrop()`
- Verify URL changes with `expect(page).toHaveURL()`
- For form submissions, wait for navigation or success indicators
- Test admin collections at `/admin/collections/{slug}` paths
- Reference actual field names from collection configs
- Keep tests under 30s each, use parallel execution where possible
