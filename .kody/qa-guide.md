# QA Guide

## Quick Reference

- Dev server: `pnpm dev` at http://localhost:3000
- Login: http://localhost:3000/login
- Admin panel: http://localhost:3000/admin

## Authentication

### Test Accounts

| Role       | Email                             | Password                             |
| ---------- | --------------------------------- | ------------------------------------ |
| Admin      | `process.env.QA_ADMIN_EMAIL`      | `process.env.QA_ADMIN_PASSWORD`      |
| Engineer   | `process.env.QA_ENGINEER_EMAIL`   | `process.env.QA_ENGINEER_PASSWORD`   |
| CEO        | `process.env.QA_CEO_EMAIL`        | `process.env.QA_CEO_PASSWORD`        |
| CTO        | `process.env.QA_CTO_EMAIL`        | `process.env.QA_CTO_PASSWORD`        |
| Researcher | `process.env.QA_RESEARCHER_EMAIL` | `process.env.QA_RESEARCHER_PASSWORD` |

### Login Steps

1. Navigate to `/login`
2. Enter email and password from test accounts table
3. Click submit button
4. Verify redirect to `/dashboard`

### Auth Files

- `src/auth/` — AuthService, JwtService, session-store, user-store
- `src/auth/withAuth.ts` — JWT validation HOC

## Navigation Map

### Admin Panel

| Collection    | URL                                | Key Fields                                                                                       |
| ------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| Assignments   | `/admin/collections/assignments`   | title, module, instructions, dueDate, maxScore, rubric, criterion, maxPoints, description        |
| Courses       | `/admin/collections/courses`       | title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label |
| Enrollments   | `/admin/collections/enrollments`   | student, course, enrolledAt, status, completedAt, completedLessons                               |
| Lessons       | `/admin/collections/lessons`       | title, course, module, order, type, content, videoUrl, estimatedMinutes                          |
| Media         | `/admin/collections/media`         | alt                                                                                              |
| Modules       | `/admin/collections/modules`       | title, course, order, description                                                                |
| Notifications | `/admin/collections/notifications` | recipient, type, title, message, link, isRead                                                    |
| Quiz Attempts | `/admin/collections/quiz-attempts` | user, quiz, score, passed, answers, startedAt, completedAt                                       |
| Quizzes       | `/admin/collections/quizzes`       | title, module, order, passingScore, timeLimit, maxAttempts, questions                            |
| Submissions   | `/admin/collections/submissions`   | assignment, student, content, file, submittedAt, status, grade, feedback, rubricScores           |
| Users         | `/admin/collections/users`         | firstName, lastName, displayName, avatar, bio, role, organization                                |
| Certificates  | `/admin/collections/certificates`  | student, course, issuedAt, certificateNumber, finalGrade                                         |
| Notes         | `/admin/collections/notes`         | title, content, tags                                                                             |

### Frontend Pages

| Route                          | Content          | Interactions                             |
| ------------------------------ | ---------------- | ---------------------------------------- |
| `/`                            | Home page        | Verify hero, navigation links            |
| `/dashboard`                   | User dashboard   | Verify enrolled courses, recent activity |
| `/instructor/courses/:id/edit` | Course editor    | Edit course details, add modules/lessons |
| `/notes`                       | Notes list       | Create, search, filter notes             |
| `/notes/:id`                   | Note detail      | View note content                        |
| `/notes/create`                | Create note form | Fill title, content, tags                |
| `/notes/edit/:id`              | Edit note form   | Modify existing note                     |

### API Endpoints

| Endpoint                     | Methods   | Purpose                                                |
| ---------------------------- | --------- | ------------------------------------------------------ |
| `/api/notes`                 | GET, POST | Note CRUD with search                                  |
| `/api/notes/[id]`            | GET       | Single note retrieval                                  |
| `/api/quizzes/[id]`          | GET       | Quiz retrieval                                         |
| `/api/quizzes/[id]/submit`   | POST      | Quiz grading                                           |
| `/api/courses/search`        | GET       | Course search (q, difficulty, tags, sort, page, limit) |
| `/api/enroll`                | POST      | Enrollment (viewer role)                               |
| `/api/gradebook/course/[id]` | GET       | Grades per course (editor/admin)                       |
| `/api/notifications`         | GET, POST | Notification CRUD                                      |

## Component Verification Patterns

- **CourseLessonsSorter**: Drag-sortable lessons grouped by module on course edit page
- **Dashboard**: Verify course cards, progress indicators, recent activity feed
- **Notes editor**: Rich text content, tag input with autocomplete
- **Quiz player**: Question navigation, timer display, answer selection states

## Common Test Scenarios

1. **Auth flow**: Login → verify dashboard → logout → verify redirect to login
2. **Course CRUD**: Create course → edit → add modules/lessons → delete
3. **Enrollment**: Navigate to course → enroll → verify in enrolled courses
4. **Quiz submission**: Start quiz → answer questions → submit → verify score
5. **Note management**: Create note → edit → search → delete

## Environment Setup

```
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
