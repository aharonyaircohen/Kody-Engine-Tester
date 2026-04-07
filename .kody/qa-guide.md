# QA Guide

## Quick Reference

- **Dev server:** `pnpm dev` at `http://localhost:3000`
- **Login page:** `/login`
- **Admin panel:** `/admin/:...segments?`

## Authentication

### Test Accounts

| Role       | Email                 | Password                 |
| ---------- | --------------------- | ------------------------ |
| Admin      | `QA_ADMIN_EMAIL`      | `QA_ADMIN_PASSWORD`      |
| Engineer   | `QA_ENGINEER_EMAIL`   | `QA_ENGINEER_PASSWORD`   |
| CEO        | `QA_CEO_EMAIL`        | `QA_CEO_PASSWORD`        |
| CTO        | `QA_CTO_EMAIL`        | `QA_CTO_PASSWORD`        |
| Researcher | `QA_RESEARCHER_EMAIL` | `QA_RESEARCHER_PASSWORD` |

### Login Steps

1. Navigate to `/login`
2. Enter credentials from the test accounts table above
3. Submit the login form
4. Verify redirect to dashboard or home page

### Auth Files

- `src/auth/withAuth.ts` — JWT validation and RBAC HOC
- `src/auth/extractBearerToken.ts` — token extraction
- `src/auth/checkRole.ts` — role guard utility

## Navigation Map

### Admin Collections

#### `/admin/collections/assignments`

- **Name:** Assignments
- **Fields:** title, module, instructions, dueDate, maxScore, rubric, criterion, maxPoints, description

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

#### `/admin/collections/certificates`

- **Name:** Certificates
- **Fields:** student, course, issuedAt, certificateNumber, finalGrade

#### `/admin/collections/notes`

- **Name:** Notes
- **Fields:** title, content, tags

### Frontend Pages

| Path                           | Expected Content                                      | Key Interactions                     |
| ------------------------------ | ----------------------------------------------------- | ------------------------------------ |
| `/`                            | Home/landing page                                     | Navigation, hero content             |
| `/dashboard`                   | User dashboard with enrolled courses, recent activity | Navigate to courses, view progress   |
| `/instructor/courses/:id/edit` | Course editor with lessons and settings               | Edit course details, reorder lessons |
| `/notes`                       | Notes list view                                       | Create, edit, delete notes           |
| `/notes/:id`                   | Note detail view                                      | View note content                    |
| `/notes/create`                | Note creation form                                    | Fill title, content, tags            |
| `/notes/edit/:id`              | Note edit form                                        | Modify and save note                 |

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

### Course Lessons Sorter (`/instructor/courses/:id/edit`)

- **Location:** Course edit page, lessons section
- **Verify:** Drag handles visible, lessons grouped by chapter/module
- **Interaction:** Drag lesson to reorder, verify order persists after save

### Note Editor

- **Location:** `/notes/create`, `/notes/edit/:id`
- **Verify:** Title field, content textarea, tags input
- **Interaction:** Type in fields, add/remove tags, save note

## Common Test Scenarios

1. **Admin Login:** Navigate to `/login`, enter admin credentials, verify redirect to `/dashboard` or admin overview
2. **Create Note:** Login → `/notes/create` → fill title/content/tags → save → verify at `/notes/:id`
3. **Edit Course:** Login as instructor → `/instructor/courses/:id/edit` → modify title → save → verify changes
4. **View Enrollments:** Login as admin → `/admin/collections/enrollments` → verify student/course columns
5. **Quiz Submission:** Navigate to quiz → answer questions → submit → verify score displayed
6. **Admin Collection CRUD:** Login as admin → navigate to any collection → create/read/update/delete items

## Environment Setup

Required env vars to start the dev server:

- `DATABASE_URL` — PostgreSQL connection string
- `PAYLOAD_SECRET` — JWT signing secret

## Dev Server

- **Command:** `pnpm dev`
- **URL:** `http://localhost:3000`
