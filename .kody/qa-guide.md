# QA Guide

## Quick Reference

- Dev server: `pnpm dev` → http://localhost:3000
- Login page: `/login`
- Admin panel: `/admin`

## Authentication

### Test Accounts

| Role       | Email                    | Password                    |
| ---------- | ------------------------ | --------------------------- |
| Admin      | `${QA_ADMIN_EMAIL}`      | `${QA_ADMIN_PASSWORD}`      |
| Engineer   | `${QA_ENGINEER_EMAIL}`   | `${QA_ENGINEER_PASSWORD}`   |
| CEO        | `${QA_CEO_EMAIL}`        | `${QA_CEO_PASSWORD}`        |
| CTO        | `${QA_CTO_EMAIL}`        | `${QA_CTO_PASSWORD}`        |
| Researcher | `${QA_RESEARCHER_EMAIL}` | `${QA_RESEARCHER_PASSWORD}` |

### Login Steps

1. Navigate to `/login`
2. Enter email and password from test accounts table
3. Click submit button
4. Verify redirect to `/dashboard` or home page

### Auth Files

- `src/auth/withAuth.ts`
- `src/auth/JwtService.ts`
- `src/middleware/auth.ts`

## Roles

`admin`, `Engineer`, `CEO`, `CTO`, `Researcher`

## Navigation Map

### Admin Panel

#### Collections

| Path                               | Name          | Fields                                                                                                                                         |
| ---------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `/admin/collections/assignments`   | Assignments   | title, module, instructions, dueDate, maxScore, rubric, criterion, maxPoints, description                                                      |
| `/admin/collections/certificates`  | Certificates  | student, course, issuedAt, certificateNumber, finalGrade                                                                                       |
| `/admin/collections/courses`       | Courses       | title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label, maxEnrollments, quizWeight, assignmentWeight |
| `/admin/collections/enrollments`   | Enrollments   | student, course, enrolledAt, status, completedAt, completedLessons                                                                             |
| `/admin/collections/lessons`       | Lessons       | title, course, module, order, type, content, videoUrl, estimatedMinutes                                                                        |
| `/admin/collections/media`         | Media         | alt                                                                                                                                            |
| `/admin/collections/modules`       | Modules       | title, course, order, description                                                                                                              |
| `/admin/collections/notes`         | Notes         | title, content, tags                                                                                                                           |
| `/admin/collections/notifications` | Notifications | recipient, type, title, message, link, isRead                                                                                                  |
| `/admin/collections/quiz-attempts` | QuizAttempts  | user, quiz, score, passed, answers, questionIndex, answer, startedAt, completedAt                                                              |
| `/admin/collections/quizzes`       | Quizzes       | title, module, order, passingScore, timeLimit, maxAttempts, questions, text, type, options, isCorrect, correctAnswer, points                   |
| `/admin/collections/submissions`   | Submissions   | assignment, student, content, attachments, file, submittedAt, status, grade, feedback, rubricScores, criterion, score, comment                 |
| `/admin/collections/users`         | Users         | firstName, lastName, displayName, avatar, bio, role, organization, refreshToken, tokenExpiresAt, lastTokenUsedAt                               |

### Frontend Pages

| Path                           | Expected Content | Key Interactions                         |
| ------------------------------ | ---------------- | ---------------------------------------- |
| `/`                            | Home page        | Navigation links, hero content           |
| `/dashboard`                   | User dashboard   | View enrolled courses, recent activity   |
| `/instructor/courses/:id/edit` | Course editor    | Edit course details, add modules/lessons |
| `/notes`                       | Notes list       | Create, view, edit notes                 |
| `/notes/:id`                   | Note detail      | View note content                        |
| `/notes/create`                | Create note form | Fill title, content, tags                |
| `/notes/edit/:id`              | Edit note form   | Modify existing note                     |

### API Endpoints

| Path                         | Methods   | Purpose               |
| ---------------------------- | --------- | --------------------- |
| `/api/notes`                 | GET, POST | Note CRUD with search |
| `/api/quizzes/[id]`          | GET       | Quiz retrieval        |
| `/api/quizzes/[id]/submit`   | POST      | Quiz grading          |
| `/api/quizzes/[id]/attempts` | GET       | User's quiz attempts  |
| `/api/courses/search`        | GET       | Course search         |
| `/api/enroll`                | POST      | Enrollment            |
| `/api/gradebook/course/[id]` | GET       | Grades per course     |

## Common Test Scenarios

### Login Flow

1. Visit `/login`
2. Fill credentials → submit
3. Assert redirect to dashboard
4. Verify role-based navigation appears

### Course CRUD (Admin)

1. Navigate to `/admin/collections/courses`
2. Click "Create" → fill title, slug, description
3. Save → verify appears in list
4. Edit entry → change title → save
5. Delete entry → confirm deletion

### Quiz Submission Flow

1. Enroll in course
2. Navigate to quiz via `/dashboard`
3. Answer questions → submit
4. Verify score and pass/fail displayed

## Component Verification Patterns

### Admin Collection List

- Location: `/admin/collections/{slug}`
- Verify: table with rows, pagination, search
- Interaction: click row to edit, "Create" button adds new

### Admin Edit Form

- Location: `/admin/collections/{slug}/:id`
- Verify: fields match collection schema, save/cancel buttons
- Interaction: fill fields → save → verify toast/success

### Frontend Notes

- Location: `/notes`, `/notes/:id`, `/notes/create`, `/notes/edit/:id`
- Verify: form renders, list displays notes
- Interaction: create note → appears in list; edit → changes persist

## Environment Setup

Required env vars:

- `DATABASE_URL` — PostgreSQL connection string
- `PAYLOAD_SECRET` — JWT signing secret

## Dev Server

```bash
pnpm dev
```

URL: http://localhost:3000
