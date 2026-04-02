# QA Guide

## Quick Reference

- Dev server: `pnpm dev` → http://localhost:3000
- Login page: http://localhost:3000/admin/login (Payload CMS auth)
- Admin panel: http://localhost:3000/admin

## Authentication

### Test Accounts

| Role       | Email                  | Password                  |
| ---------- | ---------------------- | ------------------------- |
| admin      | `$QA_ADMIN_EMAIL`      | `$QA_ADMIN_PASSWORD`      |
| Engineer   | `$QA_ENGINEER_EMAIL`   | `$QA_ENGINEER_PASSWORD`   |
| CEO        | `$QA_CEO_EMAIL`        | `$QA_CEO_PASSWORD`        |
| CTO        | `$QA_CTO_EMAIL`        | `$QA_CTO_PASSWORD`        |
| Researcher | `$QA_RESEARCHER_EMAIL` | `$QA_RESEARCHER_PASSWORD` |

### Login Steps

1. Navigate to http://localhost:3000/admin/login
2. Fill `input[name="email"]` with test account email
3. Fill `input[name="password"]` with test account password
4. Click `button[type="submit"]`
5. Verify redirect to `/admin` dashboard — you should see "Dashboard" heading and collection nav sidebar

### Auth Files

- `src/collections/Users.ts` — role field with `saveToJWT: true`
- `src/access/` — access control functions
- `src/middleware/` — auth guards, rate limiting

## Navigation Map

### Admin Panel

| Path                                | Expected Content                       | Key Fields                                                                                           |
| ----------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `/admin`                            | Dashboard with collection list sidebar | Collection links in left nav                                                                         |
| `/admin/collections/users`          | Users list table                       | firstName, lastName, role, organization                                                              |
| `/admin/collections/users/create`   | User create form                       | firstName, lastName, displayName, role, avatar, bio                                                  |
| `/admin/collections/courses`        | Courses list table                     | title, status, difficulty, instructor                                                                |
| `/admin/collections/courses/create` | Course create form                     | title, slug, description, thumbnail, status, difficulty, estimatedHours, tags                        |
| `/admin/collections/lessons`        | Lessons list table                     | title, course, module, type, order                                                                   |
| `/admin/collections/lessons/create` | Lesson create form                     | title, course, module, order, type, videoUrl, estimatedMinutes; Lexical rich-text editor for content |
| `/admin/collections/assignments`    | Assignments list                       | title, module, dueDate, maxScore                                                                     |
| `/admin/collections/quizzes`        | Quizzes list                           | title, module, passingScore, timeLimit                                                               |
| `/admin/collections/enrollments`    | Enrollments list                       | student, course, status, enrolledAt                                                                  |
| `/admin/collections/submissions`    | Submissions list                       | assignment, student, status, grade                                                                   |
| `/admin/collections/certificates`   | Certificates list                      | student, course, issuedAt, certificateNumber                                                         |
| `/admin/collections/notes`          | Notes list                             | title, content, tags                                                                                 |
| `/admin/collections/notifications`  | Notifications list                     | recipient, type, title, isRead                                                                       |
| `/admin/collections/quiz-attempts`  | Quiz attempts list                     | user, quiz, score, passed                                                                            |
| `/admin/collections/media`          | Media library grid                     | alt text, file upload                                                                                |

### Frontend Pages

| Path                           | Expected Content                   | Key Interactions                             |
| ------------------------------ | ---------------------------------- | -------------------------------------------- |
| `/`                            | Landing/home page                  | Verify page loads, no JS errors              |
| `/dashboard`                   | Authenticated user dashboard       | Requires login; verify user-specific content |
| `/notes`                       | Notes list for current user        | Verify notes appear, "Create" button visible |
| `/notes/create`                | Note creation form                 | Fill title, content, tags; submit            |
| `/notes/:id`                   | Note detail view                   | Verify title and content render              |
| `/notes/edit/:id`              | Note edit form                     | Fields pre-populated; verify save            |
| `/instructor/courses/:id/edit` | Course edit form (instructor role) | Requires instructor/admin role               |

### API Endpoints

| Path                 | Methods   | Purpose                   |
| -------------------- | --------- | ------------------------- |
| `/api/users`         | GET, POST | Users CRUD (Payload REST) |
| `/api/courses`       | GET, POST | Courses CRUD              |
| `/api/lessons`       | GET, POST | Lessons CRUD              |
| `/api/enrollments`   | GET, POST | Enrollment management     |
| `/api/submissions`   | GET, POST | Assignment submissions    |
| `/api/quiz-attempts` | GET, POST | Quiz attempt tracking     |
| `/api/certificates`  | GET, POST | Certificate issuance      |
| `/api/media`         | GET, POST | File uploads              |

## Component Verification Patterns

### Lexical Rich Text Editor (Lesson content)

1. Navigate to `/admin/collections/lessons/create`
2. Scroll to `content` field — you should see a Lexical editor toolbar with bold, italic, list buttons
3. Click into the editor area and type text
4. Click Bold button — verify text becomes `<strong>`-styled
5. Verify editor content persists on save

### Relationship Fields (course → lessons, enrollment → student)

1. Open `/admin/collections/enrollments/create`
2. Click the `student` relationship field — you should see a dropdown/search modal
3. Type a name — verify filtered user options appear
4. Select a user — verify pill/tag renders in field
5. Repeat for `course` field

### Media Upload

1. Navigate to `/admin/collections/media`
2. Click "Create New" — you should see file drag-drop zone
3. Upload an image — verify thumbnail appears in list view
4. Verify `alt` field is editable

## Common Test Scenarios

### Admin CRUD: Course Creation

1. Login as admin
2. Go to `/admin/collections/courses/create`
3. Fill: title="Test Course", slug="test-course", status="draft", difficulty="beginner"
4. Click Save — verify redirect to edit view with generated ID in URL
5. Verify success toast appears

### Role-Based Access

1. Login as non-admin role (Engineer)
2. Attempt to access `/admin/collections/users` — verify either access denied message or limited view
3. Verify role-restricted collections are hidden or read-only in sidebar

### Frontend Auth Guard

1. Without logging in, navigate to `/dashboard`
2. Verify redirect to login page or 401 response
3. Login, retry `/dashboard` — verify content loads

### Note CRUD (Frontend)

1. Login, navigate to `/notes/create`
2. Fill title and content fields, submit
3. Verify redirect to `/notes/:id` or `/notes` list
4. Click edit — verify form pre-filled
5. Update content, save — verify changes persist

### Admin Unauthenticated Redirect

1. Clear cookies/session
2. Navigate to `/admin/collections/courses`
3. Verify redirect to `/admin/login`

## Environment Setup

| Variable         | Purpose                            |
| ---------------- | ---------------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string       |
| `PAYLOAD_SECRET` | JWT signing secret for Payload CMS |

## Dev Server

```bash
pnpm dev
# → http://localhost:3000
# → Admin panel: http://localhost:3000/admin
```
