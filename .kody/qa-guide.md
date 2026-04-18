# QA Guide

## Quick Reference

- **Dev server:** `pnpm dev` at `http://localhost:3000`
- **Login page:** `/login`
- **Admin panel:** `/admin/:...segments?`

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

- `src/auth/` — authentication logic
- `src/contexts/auth-context.tsx` — client-side auth state
- `src/middleware/role-guard.ts` — route protection

## Roles

- `admin`
- `Engineer`
- `CEO`
- `CTO`
- `Researcher`

## Navigation Map

### Admin Panel

| Path                               | What to Expect                                                            |
| ---------------------------------- | ------------------------------------------------------------------------- |
| `/admin`                           | Payload CMS admin dashboard                                               |
| `/admin/collections/assignments`   | Assignments list — title, module, dueDate, maxScore fields visible        |
| `/admin/collections/courses`       | Courses list — title, slug, instructor, status, difficulty fields         |
| `/admin/collections/enrollments`   | Enrollments list — student, course, status, enrolledAt fields             |
| `/admin/collections/lessons`       | Lessons list — title, course, module, order, type fields                  |
| `/admin/collections/media`         | Media list — alt text field                                               |
| `/admin/collections/modules`       | Modules list — title, course, order, description fields                   |
| `/admin/collections/notifications` | Notifications list — recipient, type, title, isRead fields                |
| `/admin/collections/quiz-attempts` | QuizAttempts list — user, quiz, score, passed, startedAt fields           |
| `/admin/collections/quizzes`       | Quizzes list — title, module, passingScore, timeLimit, maxAttempts fields |
| `/admin/collections/submissions`   | Submissions list — assignment, student, status, grade, submittedAt fields |
| `/admin/collections/users`         | Users list — firstName, lastName, role, organization fields               |
| `/admin/collections/certificates`  | Certificates list — student, course, issuedAt, certificateNumber fields   |
| `/admin/collections/notes`         | Notes list — title, content, tags fields                                  |

### Frontend Pages

| Path                           | Expected Content                | Key Interactions                  |
| ------------------------------ | ------------------------------- | --------------------------------- |
| `/`                            | Homepage with course listings   | Verify hero, navigation links     |
| `/dashboard`                   | User dashboard with enrollments | Verify user info, course progress |
| `/instructor/courses/:id/edit` | Course editor form              | Edit course title, save changes   |
| `/notes`                       | Notes list view                 | Create, view, edit notes          |
| `/notes/:id`                   | Single note view                | Verify note content displays      |
| `/notes/create`                | Note creation form              | Fill title, content, tags         |
| `/notes/edit/:id`              | Note edit form                  | Modify and save note              |

### API Endpoints

| Path                         | Methods   | Purpose                        |
| ---------------------------- | --------- | ------------------------------ |
| `/api/notes`                 | GET, POST | Note CRUD with search          |
| `/api/quizzes/[id]`          | GET       | Quiz retrieval                 |
| `/api/quizzes/[id]/submit`   | POST      | Quiz grading                   |
| `/api/quizzes/[id]/attempts` | GET       | User's quiz attempts           |
| `/api/courses/search`        | GET       | Course search with sort/filter |
| `/api/enroll`                | POST      | Enrollment creation            |
| `/api/gradebook/course/[id]` | GET       | Grades per course              |

## Component Verification Patterns

### Admin Collection Forms

- Navigate to `/admin/collections/{slug}`
- Verify list view shows expected columns
- Click "Create" or edit icon to open form
- Verify all fields render correctly (title inputs, selects, date pickers)
- Test save/cancel actions

### Frontend Notes

- Navigate to `/notes` or `/notes/create`
- Fill form fields and submit
- Verify redirect to note detail page
- Check content renders correctly

### Course Editor

- Navigate to `/instructor/courses/:id/edit`
- Verify CourseLessonsSorter component shows drag-sortable lessons
- Drag and drop to reorder lessons
- Save and verify order persists

## Common Test Scenarios

1. **Admin CRUD:** Create a new assignment → edit it → delete it
2. **User Enrollment:** Login as student → browse courses → enroll in a course
3. **Quiz Flow:** Start quiz → answer questions → submit → verify score
4. **Notes:** Create note → edit note → delete note
5. **Auth:** Login → verify role-based access → logout

## Environment Setup

Required env vars:

- `DATABASE_URL` — PostgreSQL connection string
- `PAYLOAD_SECRET` — Payload CMS secret key

## Dev Server

```bash
pnpm dev
```

- URL: `http://localhost:3000`
- Wait for "Ready" message before testing
- Payload admin available at `/admin`
