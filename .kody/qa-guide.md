# QA Guide

## Quick Reference

- **Dev server:** `pnpm dev` → http://localhost:3000
- **Login:** http://localhost:3000/login
- **Admin panel:** http://localhost:3000/admin

## Authentication

### Test Accounts

| Role   | Email           | Password           |
| ------ | --------------- | ------------------ |
| Admin  | QA_ADMIN_EMAIL  | QA_ADMIN_PASSWORD  |
| Editor | QA_EDITOR_EMAIL | QA_EDITOR_PASSWORD |
| Viewer | QA_VIEWER_EMAIL | QA_VIEWER_PASSWORD |

### Login Steps

1. Navigate to `/login`
2. Enter email and password
3. Click submit button
4. Verify redirect to `/dashboard`

### Auth Files

- `src/auth/withAuth.ts` — JWT validation and RBAC HOC
- `src/auth/_auth.ts` — Role hierarchy definition
- `src/utils/di-container.ts` — Auth service dependency injection

## Navigation Map

### Admin Panel

| Collection    | URL                                | Key Fields                                                                                |
| ------------- | ---------------------------------- | ----------------------------------------------------------------------------------------- |
| Assignments   | `/admin/collections/assignments`   | title, module, instructions, dueDate, maxScore, rubric                                    |
| Certificates  | `/admin/collections/certificates`  | student, course, issuedAt, certificateNumber, finalGrade                                  |
| Courses       | `/admin/collections/courses`       | title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags |
| Enrollments   | `/admin/collections/enrollments`   | student, course, enrolledAt, status, completedAt, completedLessons                        |
| Lessons       | `/admin/collections/lessons`       | title, course, module, order, type, content, videoUrl, estimatedMinutes                   |
| Media         | `/admin/collections/media`         | alt                                                                                       |
| Modules       | `/admin/collections/modules`       | title, course, order, description                                                         |
| Notes         | `/admin/collections/notes`         | title, content, tags                                                                      |
| Notifications | `/admin/collections/notifications` | recipient, type, title, message, link, isRead                                             |
| Quiz Attempts | `/admin/collections/quiz-attempts` | user, quiz, score, passed, answers, startedAt, completedAt                                |
| Quizzes       | `/admin/collections/quizzes`       | title, module, order, passingScore, timeLimit, maxAttempts, questions                     |
| Submissions   | `/admin/collections/submissions`   | assignment, student, content, file, submittedAt, status, grade, feedback                  |
| Users         | `/admin/collections/users`         | firstName, lastName, displayName, avatar, bio, role, organization                         |

### Frontend Pages

| Route                          | Purpose           | Key Interactions                                 |
| ------------------------------ | ----------------- | ------------------------------------------------ |
| `/`                            | Home/landing page | Hero section, course listing, navigation links   |
| `/dashboard`                   | User dashboard    | Enrolled courses, recent activity, notifications |
| `/instructor/courses/:id/edit` | Course editor     | Edit course details, manage modules/lessons      |
| `/notes`                       | Notes listing     | Search, filter by tags                           |
| `/notes/create`                | Create note       | Title, content, tags form                        |
| `/notes/:id`                   | View note         | Display note content                             |
| `/notes/edit/:id`              | Edit note         | Pre-filled form with title, content, tags        |

### API Endpoints

| Endpoint                    | Methods          | Purpose             |
| --------------------------- | ---------------- | ------------------- |
| `/api/notes`                | GET, POST        | List/create notes   |
| `/api/notes/:id`            | GET, PUT, DELETE | Single note CRUD    |
| `/api/quizzes/:id`          | GET              | Retrieve quiz       |
| `/api/quizzes/:id/submit`   | POST             | Submit quiz answers |
| `/api/courses/search`       | GET              | Search courses      |
| `/api/enroll`               | POST             | Enroll in course    |
| `/api/gradebook/course/:id` | GET              | Course grades       |

## Component Verification Patterns

### Admin Collection List View

Navigate to `/admin/collections/{slug}`. Verify: collection title, row count, columns match fields listed above. Click row to open edit view.

### Admin Edit Form

Navigate to `/admin/collections/{slug}/:id`. Verify: all fields render, save button visible, relationship fields load related documents.

### Drag-and-Drop (Course Editor)

Navigate to `/instructor/courses/:id/edit`. Verify: modules expandable, drag handles visible, drop zones highlight on drag.

### Notes CRUD

1. Create: `/notes/create` → fill title/content/tags → submit → redirect to `/notes/:id`
2. View: `/notes/:id` → display title, content, tags
3. Edit: `/notes/edit/:id` → pre-filled form → modify → submit
4. Delete: edit page → delete button → confirm

### Quiz Flow

1. Start quiz at quiz page
2. Answer questions sequentially
3. Submit → verify score display and pass/fail indicator

## Common Test Scenarios

**Admin CRUD (Payload CMS):**

1. Navigate to `/admin/collections/{collection}`
2. Click "Create" button
3. Fill required fields
4. Save → verify redirect to list with new entry
5. Click entry → edit page loads with correct values
6. Modify and save → verify changes persist

**User Enrollment:**

1. Log in as viewer role
2. Browse courses at `/`
3. Click course → course detail page
4. Click "Enroll" → POST to `/api/enroll`
5. Verify redirect to dashboard with enrolled course visible

**Role-Based Access:**

1. Log in as each role (Admin, Engineer, CEO, CTO, Researcher)
2. Attempt restricted routes (admin panel, instructor edit)
3. Verify 403/forbidden for unauthorized roles

## Environment Setup

```bash
DATABASE_URL=postgresql://...
PAYLOAD_SECRET=your-secret-here
QA_ADMIN_EMAIL=admin@example.com
QA_ADMIN_PASSWORD=CHANGE_ME
```

## Dev Server

```bash
pnpm dev
# Runs at http://localhost:3000
```

## Rules

- Use `localhost:3000` for all Playwright navigation
- Admin routes require admin role authentication
- Quiz submission requires authenticated user session
- Relationship fields in Payload admin load async — wait for options to populate
