# QA Guide

## Quick Reference

- **Dev server:** `pnpm dev` at `http://localhost:3000`
- **Login page:** `/login`
- **Admin panel:** `/admin/collections/{slug}`

## Authentication

### Test Accounts

| Role  | Email               | Password               |
| ----- | ------------------- | ---------------------- |
| Admin | `${QA_ADMIN_EMAIL}` | `${QA_ADMIN_PASSWORD}` |
| User  | `${QA_USER_EMAIL}`  | `${QA_USER_PASSWORD}`  |

### Login Steps

1. Navigate to `/login`
2. Enter email and password from the test accounts table above
3. Click the submit button
4. Verify redirect to `/dashboard`

### Auth Files

- `src/auth/` — JWT service, session store, withAuth HOC
- `src/middleware/` — Auth middleware (role guards)
- `src/hooks/` — Auth hook functions

## Roles

- `admin`
- `Engineer`
- `CEO`
- `CTO`
- `Researcher`

## Navigation Map

### Frontend Pages

| Path                           | Expected Content                                 | Key Interactions                            |
| ------------------------------ | ------------------------------------------------ | ------------------------------------------- |
| `/`                            | Home page                                        | —                                           |
| `/dashboard`                   | Dashboard with enrolled courses, recent activity | —                                           |
| `/instructor/courses/:id/edit` | Course editor                                    | Edit course details, manage modules/lessons |
| `/notes`                       | Notes list                                       | Create, view, edit notes                    |
| `/notes/:id`                   | Note detail                                      | View full note content                      |
| `/notes/create`                | New note form                                    | Fill title, content, tags                   |
| `/notes/edit/:id`              | Edit note form                                   | Update note fields                          |

### Admin Collections

#### `/admin/collections/assignments`

- **Fields:** title, module, instructions, dueDate, maxScore, rubric, criterion, maxPoints, description

#### `/admin/collections/certificates`

- **Fields:** student, course, issuedAt, certificateNumber, finalGrade

#### `/admin/collections/courses`

- **Fields:** title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label

#### `/admin/collections/enrollments`

- **Fields:** student, course, enrolledAt, status, completedAt, completedLessons

#### `/admin/collections/lessons`

- **Fields:** title, course, module, order, type, content, videoUrl, estimatedMinutes

#### `/admin/collections/media`

- **Fields:** alt

#### `/admin/collections/modules`

- **Fields:** title, course, order, description

#### `/admin/collections/notifications`

- **Fields:** recipient, type, title, message, link, isRead

#### `/admin/collections/notes`

- **Fields:** title, content, tags

#### `/admin/collections/quiz-attempts`

- **Fields:** user, quiz, score, passed, answers, questionIndex, answer, startedAt, completedAt

#### `/admin/collections/quizzes`

- **Fields:** title, module, order, passingScore, timeLimit, maxAttempts, questions, text, type, options

#### `/admin/collections/submissions`

- **Fields:** assignment, student, content, attachments, file, submittedAt, status, grade, feedback, rubricScores

#### `/admin/collections/users`

- **Fields:** firstName, lastName, displayName, avatar, bio, role, organization, refreshToken, tokenExpiresAt, lastTokenUsedAt

### API Endpoints

| Path                         | Methods                  | Purpose                    |
| ---------------------------- | ------------------------ | -------------------------- |
| `/api/notes/[id]`            | GET, POST                | Single note operations     |
| `/api/quizzes/[id]/attempts` | GET                      | Quiz attempt history       |
| `/api/[collection]`          | GET, POST, PATCH, DELETE | CRUD via Payload Local API |

## Component Verification Patterns

### Admin Collection List

- Navigate to `/admin/collections/{slug}`
- Verify table displays with correct column headers
- Verify row count matches expected data
- Test sorting, filtering if available

### Admin Edit Form

- Navigate to `/admin/collections/{slug}/{id}`
- Verify all fields render with correct types (text, date, select, etc.)
- Fill each field and save
- Verify success notification appears
- Verify data persists after page reload

### Course Editor (`/instructor/courses/:id/edit`)

- Verify course title, description fields are editable
- Verify module/lesson sections are visible
- Verify drag-sort works for lessons within modules
- Verify save button updates course

### Notes CRUD

- Create: POST to `/notes/create` → verify redirect to note list
- Read: Navigate to `/notes/:id` → verify title and content render
- Update: Click edit button → modify fields → save → verify changes
- Delete: Click delete → confirm → verify removal from list

## Common Test Scenarios

### Login Flow

1. Navigate to `/login`
2. Enter invalid credentials → verify error message
3. Enter valid admin credentials → verify redirect to dashboard
4. Verify role-based navigation items appear

### Course Enrollment Flow

1. As student, navigate to `/dashboard`
2. Browse available courses
3. Click enroll → verify enrollment in `/admin/collections/enrollments`
4. Verify course appears in student dashboard

### Assignment Submission Flow

1. Navigate to course assignment
2. Fill submission form with content
3. Attach files if applicable
4. Submit → verify status in `/admin/collections/submissions`

### Quiz Attempt Flow

1. Start quiz from course module
2. Answer questions sequentially
3. Complete → verify score in `/admin/collections/quiz-attempts`
4. Verify pass/fail status based on passingScore

### Role Switch (Admin)

1. Login as admin
2. Navigate to `/admin/collections/users`
3. Edit user role from `Engineer` to `CTO`
4. Verify user sees updated permissions on next login

## Environment Setup

Required environment variables:

- `DATABASE_URL` — PostgreSQL connection string
- `PAYLOAD_SECRET` — Secret for Payload CMS encryption

## Dev Server

- **Command:** `pnpm dev`
- **URL:** `http://localhost:3000`

## Rules

- Use test accounts from env vars — never hardcode credentials
- Clear browser state between role tests to avoid session conflicts
- Verify all form submissions show success/error feedback before continuing
- Reload pages to confirm data persistence after mutations
