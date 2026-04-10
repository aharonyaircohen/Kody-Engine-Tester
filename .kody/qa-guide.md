# QA Guide

## Quick Reference

- **Dev server:** `pnpm dev` at `http://localhost:3000`
- **Login page:** `http://localhost:3000/login`
- **Admin panel:** `http://localhost:3000/admin`

## Authentication

### Test Accounts

| Role  | Email             | Password             |
| ----- | ----------------- | -------------------- |
| Admin | ${QA_ADMIN_EMAIL} | ${QA_ADMIN_PASSWORD} |
| User  | ${QA_USER_EMAIL}  | ${QA_USER_PASSWORD}  |

### Login Steps

1. Navigate to `/login`
2. Enter credentials from the test accounts table above
3. Submit the login form
4. Verify redirect to dashboard or home page

### Auth Files

- `src/auth/withAuth.ts` — JWT validation HOC
- `src/auth/jwt.service.ts` — Web Crypto JWT handling
- `src/auth/session-store.ts` — In-memory session storage

## Roles

- `admin`
- `Engineer`
- `CEO`
- `CTO`
- `Researcher`

## Navigation Map

### Frontend Pages

| Path                           | Expected Content                     | Key Interactions                               |
| ------------------------------ | ------------------------------------ | ---------------------------------------------- |
| `/`                            | Home/landing page                    | Verify hero, navigation, course listings       |
| `/dashboard`                   | User dashboard with enrolled courses | Verify course cards, progress indicators       |
| `/instructor/courses/:id/edit` | Course editor                        | Edit course title, description, manage modules |
| `/notes`                       | Notes listing                        | Create, search, filter notes                   |
| `/notes/create`                | Note creation form                   | Fill title, content, tags                      |
| `/notes/:id`                   | Note detail view                     | View note content, edit/delete buttons         |
| `/notes/edit/:id`              | Note editing form                    | Pre-filled form, save/cancel                   |

### Admin Panel

| Path                               | Purpose                 | Key Elements                                 |
| ---------------------------------- | ----------------------- | -------------------------------------------- |
| `/admin`                           | Payload admin dashboard | Collection links, settings                   |
| `/admin/collections/assignments`   | Assignments list        | Table with title, module, dueDate columns    |
| `/admin/collections/courses`       | Courses list            | Table with title, instructor, status columns |
| `/admin/collections/enrollments`   | Enrollments list        | Student, course, status columns              |
| `/admin/collections/lessons`       | Lessons list            | Title, course, module, type columns          |
| `/admin/collections/media`         | Media library           | Uploaded files with alt text                 |
| `/admin/collections/modules`       | Modules list            | Title, course, order columns                 |
| `/admin/collections/notifications` | Notifications list      | Recipient, type, isRead columns              |
| `/admin/collections/quiz-attempts` | Quiz attempts           | User, quiz, score, passed columns            |
| `/admin/collections/quizzes`       | Quizzes list            | Title, module, passingScore columns          |
| `/admin/collections/submissions`   | Assignment submissions  | Assignment, student, status, grade columns   |
| `/admin/collections/users`         | Users list              | Name, role, organization columns             |
| `/admin/collections/certificates`  | Certificates list       | Student, course, certificateNumber columns   |
| `/admin/collections/notes`         | Notes list (admin)      | Title, content preview, tags                 |

### API Endpoints

| Path                        | Methods   | Purpose                    |
| --------------------------- | --------- | -------------------------- |
| `/api/notes`                | GET, POST | Note CRUD with search      |
| `/api/notes/:id`            | GET       | Single note retrieval      |
| `/api/quizzes/:id`          | GET       | Quiz retrieval             |
| `/api/quizzes/:id/submit`   | POST      | Quiz grading               |
| `/api/quizzes/:id/attempts` | GET       | User's quiz attempts       |
| `/api/courses/search`       | GET       | Course search with filters |
| `/api/enroll`               | POST      | Course enrollment          |
| `/api/gradebook/course/:id` | GET       | Grades per course          |

## Component Verification Patterns

### Admin Components (Payload CMS)

- **Collection tables:** Verify sortable columns, row selection, bulk actions
- **Edit forms:** Verify field validation, relationship pickers, conditional fields
- **Media picker:** Verify alt text input, preview thumbnails
- **Slug field:** Verify auto-generation from title, manual override

### Frontend Components

- **CourseCard:** Verify thumbnail, title, instructor, progress bar, enrollment status
- **LessonPlayer:** Verify video/text content rendering, navigation between lessons
- **QuizForm:** Verify question rendering, answer selection, timer display
- **NoteEditor:** Verify rich text input, tag autocomplete, auto-save indicator

## Common Test Scenarios

### Auth Flow

1. Navigate to `/login`
2. Submit invalid credentials → verify error message
3. Submit valid admin credentials → verify redirect to `/dashboard` or `/admin`
4. Logout and verify protected routes redirect to login

### Course CRUD (Admin)

1. Go to `/admin/collections/courses`
2. Click "Create" → fill title, slug, description, instructor
3. Save → verify course appears in list
4. Edit course → modify fields → save
5. Delete course → verify removal from list

### Enrollment Flow

1. As student, browse courses at `/dashboard`
2. Click enroll on a course → verify enrollment confirmation
3. Go to `/admin/collections/enrollments` → verify new enrollment record

### Note Creation (Frontend)

1. Navigate to `/notes/create`
2. Fill title, content, tags
3. Save → verify redirect to `/notes/:id`
4. Edit note at `/notes/edit/:id` → save changes

### Quiz Submission

1. Start quiz at lesson/course page
2. Answer questions → submit
3. Verify score display, pass/fail status
4. Check `/admin/collections/quiz-attempts` for record

## Environment Setup

Required env vars:

- `DATABASE_URL` — PostgreSQL connection string
- `PAYLOAD_SECRET` — JWT signing secret

Optional for dev:

- `PORT=3000` (defaults to 3000)

## Dev Server

- **Command:** `pnpm dev`
- **URL:** `http://localhost:3000`

## Rules

- Use Playwright `page.goto()` with URL relative to base `http://localhost:3000`
- Wait for navigation with `page.waitForURL()` after form submissions
- Verify elements with `page.locator().first()` for dynamic lists
- Use `page.waitForResponse()` for API call verification
- Admin routes require authentication — login before navigating to `/admin/*`
