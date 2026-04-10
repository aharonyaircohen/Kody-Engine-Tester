# QA Guide

## Quick Reference

- Dev server command: `pnpm dev`
- URL: http://localhost:3000
- Login page URL: `/login`
- Admin panel URL: `/admin` (wildcard catch-all for `/admin/:...segments?`)

## Authentication

### Test Accounts

| Role  | Email               | Password  |
| ----- | ------------------- | --------- |
| Admin | `admin@example.com` | CHANGE_ME |
| User  | `user@example.com`  | CHANGE_ME |

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

### Frontend Pages

| Path                           | Expected Content   | Key Interactions                    |
| ------------------------------ | ------------------ | ----------------------------------- |
| `/`                            | Landing page       | —                                   |
| `/dashboard`                   | User dashboard     | —                                   |
| `/instructor/courses/:id/edit` | Course editor      | Edit course details, manage lessons |
| `/notes`                       | Notes list         | Create, view, edit notes            |
| `/notes/create`                | Note creation form | Fill title, content, tags           |
| `/notes/:id`                   | Note detail view   | View note content                   |
| `/notes/edit/:id`              | Note edit form     | Modify title, content, tags         |

### Admin Panel

| Path                               | Elements                | Key Fields                                                                                       |
| ---------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------ |
| `/admin`                           | Payload admin dashboard | —                                                                                                |
| `/admin/collections/assignments`   | Assignments list        | title, module, dueDate, maxScore                                                                 |
| `/admin/collections/certificates`  | Certificates list       | student, course, issuedAt, certificateNumber, finalGrade                                         |
| `/admin/collections/courses`       | Courses list            | title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label |
| `/admin/collections/enrollments`   | Enrollments list        | student, course, enrolledAt, status, completedAt, completedLessons                               |
| `/admin/collections/lessons`       | Lessons list            | title, course, module, order, type, content, videoUrl, estimatedMinutes                          |
| `/admin/collections/media`         | Media list              | alt                                                                                              |
| `/admin/collections/modules`       | Modules list            | title, course, order, description                                                                |
| `/admin/collections/notes`         | Notes list              | title, content, tags                                                                             |
| `/admin/collections/notifications` | Notifications list      | recipient, type, title, message, link, isRead                                                    |
| `/admin/collections/quiz-attempts` | QuizAttempts list       | user, quiz, score, passed, answers, startedAt, completedAt                                       |
| `/admin/collections/quizzes`       | Quizzes list            | title, module, order, passingScore, timeLimit, maxAttempts, questions                            |
| `/admin/collections/submissions`   | Submissions list        | assignment, student, content, submittedAt, status, grade, feedback, rubricScores                 |
| `/admin/collections/users`         | Users list              | firstName, lastName, displayName, avatar, bio, role, organization                                |

### API Endpoints

| Path                         | Methods          | Purpose                  |
| ---------------------------- | ---------------- | ------------------------ |
| `/api/auth/login`            | POST             | User login               |
| `/api/auth/register`         | POST             | User registration        |
| `/api/auth/logout`           | POST             | User logout              |
| `/api/auth/refresh`          | POST             | Refresh JWT token        |
| `/api/auth/profile`          | GET              | Get current user profile |
| `/api/courses/search`        | GET              | Search courses           |
| `/api/enroll`                | POST             | Enroll in a course       |
| `/api/gradebook/course/:id`  | GET              | Get course grades        |
| `/api/notifications`         | GET, POST        | Notifications CRUD       |
| `/api/notifications/:id`     | GET, PUT, DELETE | Single notification      |
| `/api/quizzes/:id`           | GET              | Get quiz                 |
| `/api/quizzes/:id/submit`    | POST             | Submit quiz answers      |
| `/api/quizzes/:id/attempts`  | GET              | Get user's quiz attempts |
| `/api/dashboard/admin-stats` | GET              | Admin statistics         |
| `/api/health`                | GET              | Health check             |

## Component Verification Patterns

### Admin Collections UI

- Navigate to `/admin/collections/{slug}` to access each collection
- List view shows all records with key fields as columns
- Click a record to open the edit form
- Edit forms show all fields configured for that collection

### Frontend Notes CRUD

- `/notes` — lists all notes with title and tags
- `/notes/create` — form with title (text input), content (textarea), tags (text input)
- `/notes/:id` — renders note content; click Edit to navigate to `/notes/edit/:id`
- `/notes/edit/:id` — pre-filled form; submit saves and redirects to `/notes/:id`

## Common Test Scenarios

### Login Flow

1. Visit `/login`
2. Enter admin credentials
3. Submit → should redirect to `/dashboard` or `/admin`

### Admin CRUD (Notes Example)

1. Go to `/admin/collections/notes`
2. Click "Create" button
3. Fill: title="Test Note", content="QA test content", tags="qa"
4. Save → should appear in list
5. Click record → edit form loads
6. Modify title, save → verify change persists

### Course Enrollment Flow

1. Login as user
2. Browse courses at `/dashboard` or via search
3. Click enroll → POST `/api/enroll`
4. Verify enrollment appears in `/admin/collections/enrollments`

## Environment Setup

Required env vars:

- `DATABASE_URL` — PostgreSQL connection string
- `PAYLOAD_SECRET` — Secret for Payload CMS

## Dev Server

- Command: `pnpm dev`
- URL: http://localhost:3000

## Rules

- Be SPECIFIC to this project — reference actual URLs, collection names, component names
- For admin panels (Payload CMS), include the exact `/admin/collections/{slug}` paths
- Include visual assertions: "you should see X", "verify Y is visible"
- Include interaction tests: "click button X", "fill field Y", "drag item Z"
- Keep under 200 lines total
- Output ONLY the markdown. No explanation before or after.
