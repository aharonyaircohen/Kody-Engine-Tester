# QA Guide

## Quick Reference

- **Dev server:** `pnpm dev` → http://localhost:3000
- **Login page:** `/login`
- **Admin panel:** `/admin` (Payload CMS)

## Authentication

### Test Accounts

| Role  | Email             | Password  |
| ----- | ----------------- | --------- |
| Admin | admin@example.com | CHANGE_ME |
| User  | user@example.com  | CHANGE_ME |

### Login Steps

1. Navigate to `/login`
2. Enter credentials from the test accounts table above
3. Submit the login form
4. Verify redirect to dashboard or home page

### Auth Files

- `src/auth/_auth.ts`
- `src/auth/auth-service.ts`
- `src/auth/index.ts`
- `src/auth/jwt-service.ts`
- `src/auth/session-store.ts`
- `src/auth/user-store.ts`
- `src/auth/withAuth.ts`

## Roles

- `admin`
- `editor`
- `viewer`

## Navigation Map

### Admin Panel (Payload CMS)

Navigate to `/admin` after logging in as admin.

| URL                                       | What to Expect           | Key Fields / Interactions                                                                                                                                                                                                                 |
| ----------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/admin`                                  | Payload admin dashboard  | Collection list sidebar                                                                                                                                                                                                                   |
| `/admin/collections/assignments`          | Assignments list         | title, module, maxScore columns                                                                                                                                                                                                           |
| `/admin/collections/assignments/create`   | Create assignment form   | title (text), module (relationship), instructions (richText), dueDate (date), maxScore (number), rubric (array: criterion, maxPoints, description)                                                                                        |
| `/admin/collections/courses`              | Courses list             | title, slug, status columns                                                                                                                                                                                                               |
| `/admin/collections/courses/create`       | Create course form       | title, description (richText), thumbnail (media relationship), instructor (user relationship), status (select: draft/published/archived), difficulty (select), estimatedHours, tags (array), maxEnrollments, quizWeight, assignmentWeight |
| `/admin/collections/enrollments`          | Enrollments list         | student, course, enrolledAt, status columns                                                                                                                                                                                               |
| `/admin/collections/enrollments/create`   | Create enrollment form   | student (user relationship), course (course relationship), status (select: active/completed/dropped)                                                                                                                                      |
| `/admin/collections/lessons`              | Lessons list             | title, course, module, order columns                                                                                                                                                                                                      |
| `/admin/collections/lessons/create`       | Create lesson form       | title, course (relationship), module (text), order (number), type (select: video/text/interactive), content (richText), videoUrl, estimatedMinutes                                                                                        |
| `/admin/collections/media`                | Media list               | alt text column                                                                                                                                                                                                                           |
| `/admin/collections/media/create`         | Upload media form        | alt (text), file upload                                                                                                                                                                                                                   |
| `/admin/collections/modules`              | Modules list             | title, course, order columns                                                                                                                                                                                                              |
| `/admin/collections/modules/create`       | Create module form       | title, course (relationship), order, description                                                                                                                                                                                          |
| `/admin/collections/notifications`        | Notifications list       | recipient, type, title, isRead columns                                                                                                                                                                                                    |
| `/admin/collections/notifications/create` | Create notification form | recipient (user relationship), type (select), title, message, link, isRead (checkbox)                                                                                                                                                     |
| `/admin/collections/quiz-attempts`        | Quiz attempts list       | user, quiz, score, passed, completedAt columns                                                                                                                                                                                            |
| `/admin/collections/quizzes`              | Quizzes list             | title, module, passingScore, order columns                                                                                                                                                                                                |
| `/admin/collections/quizzes/create`       | Create quiz form         | title, module (text), order, passingScore, timeLimit, maxAttempts, questions (array: text, type, options with isCorrect, correctAnswer, points)                                                                                           |
| `/admin/collections/submissions`          | Submissions list         | id, assignment, student, status, grade columns                                                                                                                                                                                            |
| `/admin/collections/submissions/create`   | Create submission form   | assignment (relationship), student (user relationship), content (richText), attachments (array with media upload), submittedAt, status (select), grade, feedback, rubricScores (array: criterion, score, comment, read-only)              |
| `/admin/collections/users`                | Users list               | email, firstName, lastName, role columns                                                                                                                                                                                                  |
| `/admin/collections/users/create`         | Create user form         | firstName, lastName, email (default), role (select: admin/editor/viewer), organization, bio, avatar (media relationship)                                                                                                                  |
| `/admin/collections/certificates`         | Certificates list        | student, course, certificateNumber, finalGrade columns                                                                                                                                                                                    |
| `/admin/collections/certificates/create`  | Issue certificate form   | student (user relationship), course (course relationship), issuedAt, certificateNumber (auto-unique), finalGrade                                                                                                                          |
| `/admin/collections/notes`                | Notes list               | title, content, tags columns                                                                                                                                                                                                              |
| `/admin/collections/notes/create`         | Create note form         | title (text), content (textarea), tags (JSON array)                                                                                                                                                                                       |

### Frontend Pages

| Path                           | Expected Content | Key Interactions                                          |
| ------------------------------ | ---------------- | --------------------------------------------------------- |
| `/`                            | Home page        | Navigation to login, dashboard                            |
| `/login`                       | Login form       | Email/password fields, submit button                      |
| `/dashboard`                   | User dashboard   | Course cards, enrollment status, notifications bell       |
| `/instructor/courses/:id/edit` | Course editor    | Title, description, lesson sorter, publish button         |
| `/notes`                       | Notes list       | Create note button, note cards with title/content preview |
| `/notes/create`                | Create note form | Title input, content textarea, tags input, save button    |
| `/notes/:id`                   | Note detail view | Title, content, tags, edit/delete buttons                 |
| `/notes/edit/:id`              | Edit note form   | Pre-filled title, content, tags, save button              |

### API Endpoints

| Path                           | Methods          | Purpose                                    |
| ------------------------------ | ---------------- | ------------------------------------------ |
| `/api/health`                  | GET              | Health check                               |
| `/api/csrf-token`              | GET              | CSRF token retrieval                       |
| `/api/notes`                   | GET, POST        | List notes (search via `?q=`), create note |
| `/api/notes/[id]`              | GET, PUT, DELETE | Get/update/delete single note              |
| `/api/courses/search`          | GET              | Search courses (`?q=`)                     |
| `/api/enroll`                  | POST             | Enroll in a course (viewer+ role required) |
| `/api/gradebook`               | GET              | Gradebook overview                         |
| `/api/gradebook/course/[id]`   | GET              | Per-course gradebook (editor/admin)        |
| `/api/notifications`           | GET              | List notifications for current user        |
| `/api/notifications/read-all`  | POST             | Mark all notifications as read             |
| `/api/notifications/[id]/read` | POST             | Mark single notification as read           |
| `/api/quizzes/[id]`            | GET              | Get quiz with questions                    |
| `/api/quizzes/[id]/submit`     | POST             | Submit quiz answers, returns graded result |
| `/api/quizzes/[id]/attempts`   | GET              | Get user's attempts for a quiz             |
| `/api/dashboard/admin-stats`   | GET              | Admin dashboard statistics                 |

## Component Verification Patterns

### Admin Collection List Pages

- **URL:** `/admin/collections/{slug}`
- **Verify:** Table with rows, column headers match collection fields, pagination or "No results" if empty
- **Interaction:** Click row to navigate to edit view, click "Create" button to open create form

### Admin Create/Edit Forms

- **Verify:** All fields render with correct types (text inputs, selects, date pickers, richText editors, relationship pickers)
- **Interaction:** Fill fields, click "Save" or "Publish", verify success toast and redirect to list
- **Validation:** Submit empty required field → red error message appears

### RichText Editor (Payload)

- **Where:** Course description, assignment instructions, lesson content, submission content, feedback
- **Verify:** Toolbar visible (bold, italic, links), content editable, word count or character limit shown

### Relationship Picker (Payload)

- **Where:** Course instructor, lesson course, module course, submission student/assignment
- **Verify:** Modal opens with searchable list, selected item shows as chip/pill, clear button removes selection

### Array Field (Rubric, Questions, Options)

- **Where:** Assignment rubric criteria, quiz questions, quiz question options, submission attachments
- **Verify:** "Add" button creates new row, drag handle for reordering, trash icon to delete
- **Interaction:** Click "Add", fill nested fields, verify row appears in array

### Notes CRUD (Frontend)

- **List (`/notes`):** Cards with title, truncated content, tag pills
- **Create (`/notes/create`):** Form with title, content textarea, tags input → submit → redirect to `/notes/:id`
- **Detail (`/notes/:id`):** Full title, content, tags, Edit and Delete buttons
- **Edit (`/notes/edit/:id`):** Pre-filled form → modify → Save → redirect to detail

### Course Edit (`/instructor/courses/:id/edit`)

- **Verify:** Course title (read-only slug auto-generated), richText description, thumbnail uploader, status sidebar, difficulty, estimatedHours, tags array, weights
- **Interaction:** Modify fields, click Save → success message, navigate to dashboard

## Common Test Scenarios

### Login Flow

1. Navigate to `/login`
2. Enter admin credentials → click Submit
3. Verify URL changes to `/dashboard` or `/admin`
4. Check that admin-specific UI is visible (admin nav or admin redirect works)

### Create and View a Course (Admin)

1. Log in as admin, go to `/admin/collections/courses/create`
2. Fill: title="Test Course", description (richText), select instructor, set status=draft
3. Save → should redirect to courses list
4. Find "Test Course" in list, click row → verify edit form pre-filled

### Student Enrollment Flow

1. Log in as viewer, navigate to `/dashboard`
2. Find a published course card, click Enroll
3. POST `/api/enroll` with course ID
4. Verify enrollment appears in user's enrollments list or confirmation shown

### Note CRUD (Frontend)

1. Log in as any user, go to `/notes/create`
2. Fill title="QA Test Note", content="Testing notes feature", tags=["qa"]
3. Save → should redirect to `/notes/{newId}`
4. Verify title, content, and tags display correctly
5. Click Edit → modify content → Save → verify updated content
6. Click Delete → confirm → should redirect to `/notes`

### Quiz Submission Flow

1. Navigate to quiz detail via `/api/quizzes/[id]` response or frontend
2. Answer all questions (multiple-choice, true/false, or short-answer)
3. POST to `/api/quizzes/[id]/submit` with answers array
4. Verify response includes score, passed boolean, and per-question results

### Notification Flow

1. As admin, create notification at `/admin/collections/notifications/create`
2. Select recipient, type (e.g., "announcement"), fill title and message
3. Save → log in as recipient user
4. Verify notification appears in dashboard or `/api/notifications` response

## Required Environment Variables

- `DATABASE_URL` — PostgreSQL connection string
- `PAYLOAD_SECRET` — Secret for Payload CMS encryption

## Dev Server

- **Command:** `pnpm dev`
- **URL:** http://localhost:3000

## Rules

- Use **env var references** (e.g., `QA_ADMIN_EMAIL`, `QA_ADMIN_PASSWORD`) in test account tables — do NOT hardcode real credentials
- For **admin pages**, always include the exact `/admin/collections/{slug}` path
- For **visual verification**, state what the agent should see: "verify X is visible", "you should see Y in the table"
- For **interaction tests**, state the action: "click the Save button", "fill the title field", "drag the rubric row"
- Keep guide under 200 lines; be specific to actual URLs, collection slugs, and field names from this project
