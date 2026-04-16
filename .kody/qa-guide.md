# QA Guide

## Quick Reference

- **Dev server:** `pnpm dev` → http://localhost:3000
- **Login page:** `/login`
- **Admin panel:** `/admin` or `/admin/collections/{slug}`

## Authentication

### Test Accounts

| Role  | Email               | Password               |
| ----- | ------------------- | ---------------------- |
| Admin | `${QA_ADMIN_EMAIL}` | `${QA_ADMIN_PASSWORD}` |
| User  | `${QA_USER_EMAIL}`  | `${QA_USER_PASSWORD}`  |

### Login Steps

1. Navigate to `/login`
2. Enter credentials from the test accounts table above
3. Submit the login form
4. Verify redirect to `/dashboard` or home page

### Auth Files

- `src/auth/withAuth.ts` — JWT validation and RBAC HOC
- `src/auth/session.ts` — Session store management
- `src/auth/jwt.ts` — JWT service using Web Crypto API

## Navigation Map

### Admin Panel

| URL                                  | Expected Content        | Key Fields/Components                                                                                                |
| ------------------------------------ | ----------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `/admin`                             | Payload admin dashboard | Collections nav, breadcrumbs                                                                                         |
| `/admin/collections/assignments`     | Assignments list        | title, module, dueDate, maxScore columns                                                                             |
| `/admin/collections/assignments/new` | Assignment edit form    | title, module dropdown, instructions (Lexical), dueDate picker, maxScore, rubric builder                             |
| `/admin/collections/courses`         | Courses list            | title, slug, instructor, status, difficulty columns                                                                  |
| `/admin/collections/courses/new`     | Course edit form        | title, slug, description, thumbnail upload, instructor select, status toggle, difficulty, estimatedHours, tags input |
| `/admin/collections/enrollments`     | Enrollments list        | student, course, enrolledAt, status columns                                                                          |
| `/admin/collections/lessons`         | Lessons list            | title, course, module, order, type columns                                                                           |
| `/admin/collections/lessons/new`     | Lesson edit form        | title, course dropdown, module dropdown, order, type select, content (Lexical), videoUrl, estimatedMinutes           |
| `/admin/collections/media`           | Media list              | thumbnail preview, alt text                                                                                          |
| `/admin/collections/notifications`   | Notifications list      | recipient, type, title, isRead columns                                                                               |
| `/admin/collections/quiz-attempts`   | Quiz attempts list      | user, quiz, score, passed, startedAt columns                                                                         |
| `/admin/collections/quizzes`         | Quizzes list            | title, module, passingScore, timeLimit, maxAttempts columns                                                          |
| `/admin/collections/quizzes/new`     | Quiz edit form          | title, module dropdown, order, passingScore, timeLimit, maxAttempts, questions builder                               |
| `/admin/collections/submissions`     | Submissions list        | assignment, student, submittedAt, status, grade columns                                                              |
| `/admin/collections/users`           | Users list              | firstName, lastName, displayName, role, organization columns                                                         |
| `/admin/collections/certificates`    | Certificates list       | student, course, issuedAt, certificateNumber, finalGrade columns                                                     |
| `/admin/collections/notes`           | Notes list              | title, tags columns                                                                                                  |
| `/admin/globals`                     | Global settings         | Depends on configured globals                                                                                        |

### Frontend Pages

| Path                           | Expected Content  | Key Interactions                                 |
| ------------------------------ | ----------------- | ------------------------------------------------ |
| `/`                            | Home/landing page | Hero, course listings, navigation                |
| `/dashboard`                   | User dashboard    | Enrolled courses, recent activity, notifications |
| `/instructor/courses/:id/edit` | Course editor     | Edit course details, manage modules/lessons      |
| `/notes`                       | Notes list        | Search, filter by tags                           |
| `/notes/:id`                   | Note detail       | Display note content, edit button                |
| `/notes/create`                | Create note form  | Title, content (Lexical), tags input             |
| `/notes/edit/:id`              | Edit note form    | Pre-filled title/content, save/cancel            |

### API Endpoints

| Path                         | Methods   | Purpose                           |
| ---------------------------- | --------- | --------------------------------- |
| `/api/notes`                 | GET, POST | Note CRUD with search             |
| `/api/quizzes/[id]`          | GET       | Quiz retrieval                    |
| `/api/quizzes/[id]/submit`   | POST      | Quiz grading                      |
| `/api/quizzes/[id]/attempts` | GET       | User's quiz attempts              |
| `/api/courses/search`        | GET       | Course search                     |
| `/api/enroll`                | POST      | Enrollment (viewer role required) |
| `/api/gradebook/course/[id]` | GET       | Grades per course (editor/admin)  |

## Component Verification Patterns

### Payload Rich Text (Lexical) Editor

- **Location:** Assignment instructions, lesson content, note content
- **Verify:** Toolbar visible, text formatting works, content saves
- **Interaction:** Click toolbar buttons, type text, verify rendered output

### Drag-Sortable Lists (CourseLessonsSorter)

- **Location:** `/instructor/courses/:id/edit`
- **Verify:** Drag handle visible, items sortable, order persists after save
- **Interaction:** Drag lesson to new position within module, verify order update

### Media Upload

- **Location:** Course thumbnail, lesson video
- **Verify:** Upload button, progress indicator, preview after upload
- **Interaction:** Click upload, select file, verify thumbnail preview

### Date/Time Pickers

- **Location:** Assignment dueDate, quiz timeLimit
- **Verify:** Calendar dropdown, time selection, timezone display
- **Interaction:** Click field, select date, verify formatted display

## Common Test Scenarios

1. **Admin CRUD:** Create assignment → Edit → Delete (verify list updates)
2. **Course enrollment:** Create course → Enroll user → Verify in enrollments list
3. **Quiz flow:** Create quiz with questions → Take quiz → Verify score calculated correctly
4. **Note workflow:** Create note → Edit → Verify content updates
5. **Role access:** Login as different roles → Verify only permitted routes accessible
6. **Form validation:** Submit empty required fields → Verify error messages display

## Environment Setup

```bash
DATABASE_URL=postgresql://...
PAYLOAD_SECRET=your-secret-here
QA_ADMIN_EMAIL=admin@example.com
QA_ADMIN_PASSWORD=CHANGE_ME
QA_USER_EMAIL=user@example.com
QA_USER_PASSWORD=CHANGE_ME
```

## Dev Server

```bash
pnpm dev
# Runs at http://localhost:3000
```

## Rules

- Use Playwright `page.goto()` for navigation; wait for `load` state
- Verify text content with `page.getByText()` or `page.locator()`
- Use `page.waitForURL()` after form submissions
- For Payload admin, wait for drawer/modal close animations before asserting
- Auth state persists via HTTP-only cookies — no need to login before each test
- Use `page.reload()` to reset state between test scenarios
- Check for console errors: `page.on('console', msg => { if (msg.type() === 'error') ... })`
