# QA Guide

## Quick Reference

- Dev server command: `pnpm dev`
- Dev server URL: `http://localhost:3000`
- Login page URL: `/login`
- Admin panel URL: `/admin`

## Authentication

### Test Accounts

| Role  | Email               | Password               |
| ----- | ------------------- | ---------------------- |
| Admin | `${QA_ADMIN_EMAIL}` | `${QA_ADMIN_PASSWORD}` |
| User  | `${QA_USER_EMAIL}`  | `${QA_USER_PASSWORD}`  |

> **Note:** Set these environment variables in `.env.local` or your CI environment before running tests. Example `.env.local`:
>
> ```
> QA_ADMIN_EMAIL=admin@example.com
> QA_ADMIN_PASSWORD=your-admin-password
> QA_USER_EMAIL=user@example.com
> QA_USER_PASSWORD=your-user-password
> ```

### Login Steps

1. Navigate to `/login`
2. Enter email from test accounts table above
3. Enter password
4. Click the login/submit button
5. Verify redirect to `/dashboard` or home page (`/`)
6. Verify role-based access control — admin users should see admin panel link, regular users should not

### Auth Files

- `src/auth/withAuth.ts` — Route protection HOC
- `src/auth/JwtService.ts` — JWT generation/validation
- `src/auth/AuthService.ts` — Authentication logic
- `src/access/` — Role guard functions (`checkRole.ts`, etc.)
- `src/middleware/request-logger.ts` — Auth logging middleware

## Roles

- `admin` — Full CMS access, user management, all collections
- `Engineer` — Course and content management access
- `CEO` — Executive-level access
- `CTO` — Technical leadership access
- `Researcher` — Research and analytics access

## Navigation Map

### Admin Panel

#### `/admin` — Payload CMS Admin Dashboard

- Expected: Payload CMS admin interface with collection sidebar
- Elements: Left sidebar with collection links, top navigation bar with user menu

#### `/admin/collections/assignments`

- **Name:** Assignments
- **Fields:** title, module, instructions, dueDate, maxScore, rubric, criterion, maxPoints, description
- **Verify:** Create/edit form with all fields; list view with title, module, dueDate columns

#### `/admin/collections/courses`

- **Name:** Courses
- **Fields:** title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label
- **Verify:** slug auto-generates from title; thumbnail upload field; instructor dropdown/picker
- **Custom Component:** CourseLessonsSorter (drag-sortable lessons grouped by module)

#### `/admin/collections/enrollments`

- **Name:** Enrollments
- **Fields:** student, course, enrolledAt, status, completedAt, completedLessons
- **Verify:** Student dropdown, course dropdown, status badge (active/completed/cancelled)

#### `/admin/collections/lessons`

- **Name:** Lessons
- **Fields:** title, course, module, order, type, content, videoUrl, estimatedMinutes
- **Verify:** Order field for sorting; type selector (video/text/quiz); Rich text editor for content

#### `/admin/collections/media`

- **Name:** Media
- **Fields:** alt
- **Verify:** File upload zone; gallery grid view; alt text editing

#### `/admin/collections/modules`

- **Name:** Modules
- **Fields:** title, course, order, description
- **Verify:** Course association; order field; expandable description

#### `/admin/collections/notifications`

- **Name:** Notifications
- **Fields:** recipient, type, title, message, link, isRead
- **Verify:** Recipient picker; type dropdown; isRead toggle/checkbox

#### `/admin/collections/quiz-attempts`

- **Name:** QuizAttempts
- **Fields:** user, quiz, score, passed, answers, questionIndex, answer, startedAt, completedAt
- **Verify:** Read-only list view; score display; pass/fail badge

#### `/admin/collections/quizzes`

- **Name:** Quizzes
- **Fields:** title, module, order, passingScore, timeLimit, maxAttempts, questions, text, type, options, isCorrect, correctAnswer, points
- **Verify:** Questions builder; passing score field; time limit configuration

#### `/admin/collections/submissions`

- **Name:** Submissions
- **Fields:** assignment, student, content, attachments, file, submittedAt, status, grade, feedback, rubricScores, criterion, score, comment
- **Verify:** Assignment picker; student picker; status workflow (pending/graded/returned)

#### `/admin/collections/users`

- **Name:** Users
- **Fields:** firstName, lastName, displayName, avatar, bio, role, organization, refreshToken, tokenExpiresAt, lastTokenUsedAt
- **Verify:** Role selector (admin/Engineer/CEO/CTO/Researcher); avatar upload; organization field

#### `/admin/collections/certificates`

- **Name:** Certificates
- **Fields:** student, course, issuedAt, certificateNumber, finalGrade
- **Verify:** Auto-generated certificate number; student/course association

#### `/admin/collections/notes`

- **Name:** Notes
- **Fields:** title, content, tags
- **Verify:** Rich text content; tag input/display; search/filter

### Frontend Pages

#### `/` — Home Page

- **Expected:** Landing page with course listings or marketing content
- **Verify:** Navigation bar; hero section; course cards if applicable

#### `/dashboard` — User Dashboard

- **Expected:** Personalized dashboard for logged-in user
- **Verify:** Enrolled courses list; recent activity; user greeting
- **Interaction:** Click course card to navigate; sidebar navigation

#### `/instructor/courses/:id/edit` — Course Editor (Instructor)

- **Expected:** Course edit form with all fields
- **Verify:** Title, description, thumbnail fields; module/lesson ordering
- **Interaction:** Save button; preview button; add module/lesson buttons

#### `/notes` — Notes List

- **Expected:** Grid or list of user's notes
- **Verify:** Note cards with title, preview, tags; create button
- **Interaction:** Click note to view; click create to add new

#### `/notes/:id` — Note Detail

- **Expected:** Full note view with content and tags
- **Verify:** Title, full content, tags displayed
- **Interaction:** Edit button; delete button; back navigation

#### `/notes/create` — Create Note

- **Expected:** Note creation form
- **Verify:** Title input; content editor; tags input
- **Interaction:** Save button; cancel link

#### `/notes/edit/:id` — Edit Note

- **Expected:** Pre-filled note edit form
- **Verify:** Existing title, content, tags in form fields
- **Interaction:** Update button; cancel link

### API Endpoints

| Endpoint                     | Methods          | Purpose                                   |
| ---------------------------- | ---------------- | ----------------------------------------- |
| `/api/notes`                 | GET, POST        | List and create notes with search         |
| `/api/notes/:id`             | GET, PUT, DELETE | Single note CRUD                          |
| `/api/quizzes/[id]`          | GET              | Retrieve quiz by ID                       |
| `/api/quizzes/[id]/submit`   | POST             | Submit quiz answers for grading           |
| `/api/quizzes/[id]/attempts` | GET              | List user's quiz attempts                 |
| `/api/courses/search`        | GET              | Search courses with filters               |
| `/api/enroll`                | POST             | Enroll user in course                     |
| `/api/gradebook/course/[id]` | GET              | Retrieve grades for course (editor/admin) |

## Component Verification Patterns

### CourseLessonsSorter (Admin)

- **Location:** `/admin/collections/courses` edit view
- **Navigate:** Courses → Edit any course → Scroll to lessons section
- **Verify:** Drag handles visible; lessons grouped by module
- **Interaction:** Drag lesson to reorder; verify order persists after save

### Rich Text Editor (Lexical)

- **Location:** Notes content field, Lesson content field, Quiz question editor
- **Verify:** Toolbar visible (bold, italic, link, etc.); content editable
- **Interaction:** Type text; click toolbar buttons; paste formatted content

### File Upload Zone (Media)

- **Location:** `/admin/collections/media`, Course thumbnail, User avatar
- **Verify:** Drop zone visible; upload progress indicator; preview after upload
- **Interaction:** Drag file onto zone; click to browse; delete uploaded file

### Role Selector

- **Location:** `/admin/collections/users` edit view
- **Verify:** Dropdown with roles (admin, Engineer, CEO, CTO, Researcher)
- **Interaction:** Select role; verify selection persists

## Common Test Scenarios

### Login Flow

1. Visit `/login`
2. Enter valid admin credentials
3. Submit form → verify redirect to `/dashboard`
4. Verify admin navigation visible (admin panel link in sidebar/header)

### Course CRUD (Admin)

1. Navigate to `/admin/collections/courses`
2. Click "Create" button
3. Fill: title (auto-fills slug), description, difficulty, estimatedHours
4. Upload thumbnail image
5. Save → verify in list view
6. Edit: change title → save → verify updated
7. Delete: click delete → confirm → verify removed from list

### Student Enrollment Flow

1. As admin, navigate to `/admin/collections/enrollments`
2. Click "Create"
3. Select student (user) and course
4. Set status to "active"
5. Save → verify enrollment appears in list
6. Student logs in → visits `/dashboard` → verifies enrolled course visible

### Note Creation and Editing

1. Login as any user
2. Navigate to `/notes`
3. Click "Create Note"
4. Enter title, content (rich text), tags
5. Save → verify redirected to note detail view
6. Click "Edit" → modify content → save → verify changes

### Quiz Submission

1. Enrolled student navigates to course
2. Opens a quiz lesson
3. Answers questions
4. Submits → verify score display
5. Attempt recorded in `/admin/collections/quiz-attempts`

## Environment Setup

Required environment variables in `.env.local`:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/learnhub
PAYLOAD_SECRET=your-secret-key-min-32-chars
QA_ADMIN_EMAIL=admin@example.com
QA_ADMIN_PASSWORD=your-admin-password
QA_USER_EMAIL=user@example.com
QA_USER_PASSWORD=your-user-password
```

## Dev Server

- **Command:** `pnpm dev`
- **URL:** `http://localhost:3000`
- **Startup check:** Visit `/` — should load without errors; visit `/admin` — should show Payload admin login or dashboard
