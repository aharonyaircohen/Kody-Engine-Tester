# QA Guide

## Quick Reference

- Dev server: `pnpm dev` at http://localhost:3000
- Login page: http://localhost:3000/login
- Admin panel: http://localhost:3000/admin

## Authentication

### Test Accounts

| Role       | Email                  | Password                  |
| ---------- | ---------------------- | ------------------------- |
| Admin      | ${QA_ADMIN_EMAIL}      | ${QA_ADMIN_PASSWORD}      |
| Engineer   | ${QA_ENGINEER_EMAIL}   | ${QA_ENGINEER_PASSWORD}   |
| CEO        | ${QA_CEO_EMAIL}        | ${QA_CEO_PASSWORD}        |
| CTO        | ${QA_CTO_EMAIL}        | ${QA_CTO_PASSWORD}        |
| Researcher | ${QA_RESEARCHER_EMAIL} | ${QA_RESEARCHER_PASSWORD} |

### Login Steps

1. Navigate to `/login`
2. Enter credentials from the test accounts table above
3. Submit the login form
4. Verify redirect to dashboard or home page

### Auth Files

- `src/auth`

## Navigation Map

### Admin Panel (Payload CMS)

| Collection    | URL                                | Expected Content                                                      |
| ------------- | ---------------------------------- | --------------------------------------------------------------------- |
| Assignments   | `/admin/collections/assignments`   | List view with title, module, dueDate columns                         |
| Courses       | `/admin/collections/courses`       | List view with title, slug, instructor, status columns                |
| Enrollments   | `/admin/collections/enrollments`   | List view with student, course, status columns                        |
| Lessons       | `/admin/collections/lessons`       | List view with title, course, module, order, type columns             |
| Media         | `/admin/collections/media`         | Grid/list view with alt text thumbnails                               |
| Modules       | `/admin/collections/modules`       | List view with title, course, order columns                           |
| Notifications | `/admin/collections/notifications` | List view with recipient, type, title, isRead columns                 |
| Quiz Attempts | `/admin/collections/quiz-attempts` | List view with user, quiz, score, passed columns                      |
| Quizzes       | `/admin/collections/quizzes`       | List view with title, module, passingScore, maxAttempts columns       |
| Submissions   | `/admin/collections/submissions`   | List view with assignment, student, status, grade columns             |
| Users         | `/admin/collections/users`         | List view with firstName, lastName, role, organization columns        |
| Certificates  | `/admin/collections/certificates`  | List view with student, course, certificateNumber, finalGrade columns |
| Notes         | `/admin/collections/notes`         | List view with title, content, tags columns                           |

### Frontend Pages

| Path                           | Expected Content                                       | Key Interactions                    |
| ------------------------------ | ------------------------------------------------------ | ----------------------------------- |
| `/`                            | Landing page                                           | Navigation links                    |
| `/dashboard`                   | User dashboard with enrolled courses, recent activity  | Click course cards                  |
| `/instructor/courses/:id/edit` | Course editor with title, description, modules lessons | Edit fields, reorder modules        |
| `/notes`                       | Notes list view                                        | Click note to view, create new note |
| `/notes/:id`                   | Note detail view                                       | Edit, delete note                   |
| `/notes/create`                | Note creation form                                     | Fill title, content, tags           |
| `/notes/edit/:id`              | Note edit form                                         | Modify and save                     |

### API Endpoints

| Endpoint                    | Methods   | Purpose                       |
| --------------------------- | --------- | ----------------------------- |
| `/api/courses/search`       | GET       | Search courses by query param |
| `/api/enroll`               | POST      | Enroll in a course            |
| `/api/gradebook/course/:id` | GET       | Get grades for a course       |
| `/api/health`               | GET       | Health check                  |
| `/api/notes`                | GET, POST | List/create notes             |
| `/api/notifications`        | GET       | Get notifications             |
| `/api/quizzes/:id/submit`   | POST      | Submit quiz answers           |
| `/api/quizzes/:id/attempts` | GET       | Get quiz attempts             |

## Component Verification Patterns

### Admin Components

- **Payload Admin UI**: Navigate to `/admin/collections/{slug}` for each collection
- **Form fields**: Verify visible labels match collection field definitions
- **List views**: Verify columns display expected fields
- **Create/Edit forms**: Navigate to `/admin/collections/{slug}/create` or `/admin/collections/{slug}/:id`

### Frontend Components

- **Course Card** (on `/dashboard`): Verify title, thumbnail, instructor visible, click navigates to course
- **Note Editor**: Verify title input, content textarea, tags input present
- **Lesson List**: Drag-and-drop reordering on course edit page

## Common Test Scenarios

1. **Login Flow**: Navigate to `/login` → submit valid credentials → verify redirect to `/dashboard`
2. **Course Enrollment**: Login as student → browse courses → click enroll → verify enrollment in user dashboard
3. **Create Note**: Login → navigate to `/notes/create` → fill form → submit → verify note appears in list
4. **Quiz Submission**: Login → navigate to lesson with quiz → complete quiz → submit → verify score displayed
5. **Admin CRUD**: Login as admin → navigate to `/admin/collections/notes` → create new → edit → delete → verify changes

## Environment Setup

Required env vars before running `pnpm dev`:

- `DATABASE_URL` — PostgreSQL connection string
- `PAYLOAD_SECRET` — Secret for Payload CMS encryption

## Dev Server

- Command: `pnpm dev`
- URL: http://localhost:3000
