# QA Guide

## Quick Reference

- Dev server command: `pnpm dev`
- Dev server URL: http://localhost:3000
- Login page URL: http://localhost:3000/login
- Admin panel URL: http://localhost:3000/admin

## Authentication

### Test Accounts

| Role  | Email                                | Password                        |
| ----- | ------------------------------------ | ------------------------------- |
| Admin | ${QA_ADMIN_EMAIL:-admin@example.com} | ${QA_ADMIN_PASSWORD:-CHANGE_ME} |
| User  | ${QA_USER_EMAIL:-user@example.com}   | ${QA_USER_PASSWORD:-CHANGE_ME}  |

### Login Steps

1. Navigate to `/login`
2. Enter credentials from the test accounts table above
3. Submit the login form
4. Verify redirect to dashboard or home page

### Auth Files

- `src/auth`

## Roles

- `admin`
- `Engineer`
- `CEO`
- `CTO`
- `Researcher`

## Navigation Map

### Admin Panel

#### `/admin/collections/assignments`

- **Name:** Assignments
- **Fields:** title, module, instructions, dueDate, maxScore, rubric, criterion, maxPoints, description

#### `/admin/collections/certificates`

- **Name:** certificates
- **Fields:** student, course, issuedAt, certificateNumber, finalGrade

#### `/admin/collections/courses`

- **Name:** Courses
- **Fields:** title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label

#### `/admin/collections/enrollments`

- **Name:** Enrollments
- **Fields:** student, course, enrolledAt, status, completedAt, completedLessons

#### `/admin/collections/lessons`

- **Name:** Lessons
- **Fields:** title, course, module, order, type, content, videoUrl, estimatedMinutes

#### `/admin/collections/media`

- **Name:** Media
- **Fields:** alt

#### `/admin/collections/modules`

- **Name:** Modules
- **Fields:** title, course, order, description

#### `/admin/collections/notes`

- **Name:** notes
- **Fields:** title, content, tags

#### `/admin/collections/notifications`

- **Name:** Notifications
- **Fields:** recipient, type, title, message, link, isRead

#### `/admin/collections/quiz-attempts`

- **Name:** QuizAttempts
- **Fields:** user, quiz, score, passed, answers, questionIndex, answer, startedAt, completedAt

#### `/admin/collections/quizzes`

- **Name:** Quizzes
- **Fields:** title, module, order, passingScore, timeLimit, maxAttempts, questions, text, type, options

#### `/admin/collections/submissions`

- **Name:** Submissions
- **Fields:** assignment, student, content, attachments, file, submittedAt, status, grade, feedback, rubricScores

#### `/admin/collections/users`

- **Name:** Users
- **Fields:** firstName, lastName, displayName, avatar, bio, role, organization, refreshToken, tokenExpiresAt, lastTokenUsedAt

### Frontend Pages

#### `/` (Home)

- Expected content: Home page with LearnHub branding
- Key interactions: Navigation links, login/logout buttons

#### `/dashboard`

- Expected content: User dashboard with enrolled courses, recent activity
- Key interactions: Navigate to courses, view progress

#### `/instructor/courses/:id/edit`

- Expected content: Course editor with all course fields
- Key interactions: Edit course details, save changes

#### `/notes`

- Expected content: List of user's notes
- Key interactions: Create new note, search notes, filter by tags

#### `/notes/:id`

- Expected content: Single note view with full content
- Key interactions: Edit note, delete note

#### `/notes/create`

- Expected content: Note creation form
- Key interactions: Fill title, content, tags fields; submit

#### `/notes/edit/:id`

- Expected content: Note edit form pre-populated with existing data
- Key interactions: Modify fields, save changes

### API Endpoints

#### `GET/POST /api/notes`

- Purpose: Note CRUD with search (uses `sanitizeHtml`)

#### `GET /api/quizzes/[id]`

- Purpose: Quiz retrieval

#### `POST /api/quizzes/[id]/submit`

- Purpose: Quiz grading via `QuizGrader`

#### `GET /api/quizzes/[id]/attempts`

- Purpose: User's quiz attempts

#### `GET /api/courses/search`

- Purpose: Course search with `CourseSearchService`
- Query params: sort (relevance/newest/popularity/rating), filters (difficulty, tags)

#### `POST /api/enroll`

- Purpose: Enrollment (viewer role required)

#### `GET /api/gradebook/course/[id]`

- Purpose: `PayloadGradebookService` grades per course

## Common Test Scenarios

### Admin CRUD Workflows

1. **Create:** Navigate to `/admin/collections/<collection>`, click "Create", fill form fields, submit
2. **Read:** Click on any existing item in collection list to view details
3. **Update:** Open item, modify fields, save changes
4. **Delete:** Select item(s), use delete action, confirm deletion

### Notes CRUD (Frontend)

1. Create: Navigate to `/notes/create`, fill title/content/tags, submit
2. Read: Navigate to `/notes` or `/notes/:id` to view notes
3. Update: Navigate to `/notes/edit/:id`, modify, save
4. Delete: From note view or list, use delete action

### Quiz Taking Flow

1. Navigate to course lesson containing quiz
2. Start quiz attempt at `/api/quizzes/[id]`
3. Answer questions sequentially
4. Submit quiz via POST `/api/quizzes/[id]/submit`
5. View score and pass/fail status

### Enrollment Flow

1. Browse courses at `/api/courses/search`
2. Enroll via POST `/api/enroll`
3. Verify enrollment appears in `/admin/collections/enrollments`

## Component Verification Patterns

### Payload Admin Components

- **Collection List Views:** Located at `/admin/collections/<slug>` — verify table headers, row actions (edit/delete), pagination
- **Edit/Create Forms:** Located at `/admin/collections/<slug>/create` or `/admin/collections/<slug>/:id` — verify all fields render correctly with proper labels
- **Custom Field Components:** Verify by navigating to collection edit form and checking field presence

### Frontend Components

- **Navigation:** Header/navbar visible on all pages with correct links based on auth state
- **Forms:** Verify validation messages appear for invalid input
- **Tables/Lists:** Verify pagination, sorting, filtering controls work correctly

## Environment Setup

Required environment variables:

- `DATABASE_URL` — PostgreSQL connection string
- `PAYLOAD_SECRET` — Secret key for Payload CMS

## Dev Server

- Command: `pnpm dev`
- URL: http://localhost:3000

## Rules

- Be SPECIFIC to this project — reference actual URLs, collection names, component names
- For admin panels (Payload CMS 3.80.0), include the exact `/admin/collections/{slug}` paths
- Include visual assertions: "you should see X", "verify Y is visible"
- Include interaction tests: "click button X", "fill field Y", "drag item Z"
- Keep under 200 lines total
