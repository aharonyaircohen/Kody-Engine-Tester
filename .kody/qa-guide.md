# QA Guide

## Quick Reference

- **Dev server:** `pnpm dev` → http://localhost:3000
- **Login page:** `/login`
- **Admin panel:** `/admin` (Payload CMS 3.80.0)

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

- `src/auth/withAuth.ts`
- `src/auth/session.ts`
- `src/middleware/request-logger.ts`

## Roles

- `admin`
- `Engineer`
- `CEO`
- `CTO`
- `Researcher`

## Navigation Map

### Admin Panel

| Collection    | URL Path                           | Key Fields                                                                                          |
| ------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| Assignments   | `/admin/collections/assignments`   | title, module, instructions, dueDate, maxScore, rubric, criterion, maxPoints, description           |
| Courses       | `/admin/collections/courses`       | title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label    |
| Enrollments   | `/admin/collections/enrollments`   | student, course, enrolledAt, status, completedAt, completedLessons                                  |
| Lessons       | `/admin/collections/lessons`       | title, course, module, order, type, content, videoUrl, estimatedMinutes                             |
| Media         | `/admin/collections/media`         | alt                                                                                                 |
| Modules       | `/admin/collections/modules`       | title, course, order, description                                                                   |
| Notifications | `/admin/collections/notifications` | recipient, type, title, message, link, isRead                                                       |
| Quiz Attempts | `/admin/collections/quiz-attempts` | user, quiz, score, passed, answers, questionIndex, answer, startedAt, completedAt                   |
| Quizzes       | `/admin/collections/quizzes`       | title, module, order, passingScore, timeLimit, maxAttempts, questions, text, type, options          |
| Submissions   | `/admin/collections/submissions`   | assignment, student, content, attachments, file, submittedAt, status, grade, feedback, rubricScores |
| Users         | `/admin/collections/users`         | firstName, lastName, displayName, avatar, bio, role, organization                                   |
| Certificates  | `/admin/collections/certificates`  | student, course, issuedAt, certificateNumber, finalGrade                                            |
| Notes         | `/admin/collections/notes`         | title, content, tags                                                                                |

### Frontend Pages

| Route                          | Expected Content | Key Interactions                                                               |
| ------------------------------ | ---------------- | ------------------------------------------------------------------------------ |
| `/`                            | Home page        | Verify hero, navigation, course listings                                       |
| `/dashboard`                   | User dashboard   | Verify enrolled courses, progress indicators                                   |
| `/instructor/courses/:id/edit` | Course editor    | Verify CourseLessonsSorter component, drag-sortable lessons grouped by chapter |
| `/notes`                       | Notes list       | Verify note cards, create button                                               |
| `/notes/:id`                   | Note detail      | Verify content rendering, tags display                                         |
| `/notes/create`                | Create note form | Fill title, content, tags fields                                               |
| `/notes/edit/:id`              | Edit note form   | Pre-populated fields, save button                                              |

### API Endpoints

| Endpoint                     | Methods   | Purpose                                |
| ---------------------------- | --------- | -------------------------------------- |
| `/api/notes`                 | GET, POST | Note CRUD with search                  |
| `/api/notes/[id]`            | GET       | Single note retrieval                  |
| `/api/quizzes/[id]`          | GET       | Quiz retrieval                         |
| `/api/quizzes/[id]/submit`   | POST      | Quiz grading via QuizGrader            |
| `/api/quizzes/[id]/attempts` | GET       | User's quiz attempts                   |
| `/api/courses/search`        | GET       | Course search with CourseSearchService |
| `/api/enroll`                | POST      | Enrollment (viewer role required)      |
| `/api/gradebook/course/[id]` | GET       | Grades per course (editor/admin)       |

## Component Verification Patterns

### Admin Components (Payload CMS)

- **CourseLessonsSorter**: Navigate to `/instructor/courses/:id/edit` — verify drag-sortable lessons grouped by chapter
- **LessonEditor**: Verify video/text/interactive lesson type switching
- **QuizBuilder**: Verify multiple choice, free text, code question types
- **RubricEditor**: Verify criterion/maxPoints fields, score allocation

### Frontend Components

- **Dashboard cards**: Verify enrolled courses display with progress
- **Note cards**: Verify title, excerpt, tags visible
- **Course cards**: Verify thumbnail, instructor, difficulty badge, estimated hours

## Common Test Scenarios

1. **Auth Flow**: Login → verify redirect → access protected routes → logout
2. **Course CRUD**: Create course → edit → add modules/lessons → publish
3. **Enrollment Flow**: Browse courses → enroll → verify on dashboard → complete lessons
4. **Quiz Flow**: Start quiz → answer questions → submit → verify score/feedback
5. **Notes CRUD**: Create note → edit → delete → verify list update
6. **Role Verification**: Login as different roles → verify UI shows/hides admin sections

## Environment Setup

Required env vars:

- `DATABASE_URL` — PostgreSQL connection string
- `PAYLOAD_SECRET` — Secret for Payload CMS encryption

## Dev Server

```bash
pnpm dev
```

- **URL:** http://localhost:3000

## Rules

- Use Playwright `goto()` with absolute URLs including the port
- Wait for network idle (`waitForLoadState('networkidle')`) after navigation
- Verify elements are visible with `expect(locator).toBeVisible()`
- Use `page.waitForURL()` for redirect verification after form submissions
- For Payload admin, wait for the edit view to fully load before interacting with fields
