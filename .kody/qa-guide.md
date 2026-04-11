# QA Guide

## Quick Reference

- **Dev server:** `pnpm dev` → `http://localhost:3000`
- **Login page:** `/login`
- **Admin panel:** `/admin`

## Authentication

### Test Accounts

| Role  | Email             | Password  |
| ----- | ----------------- | --------- |
| Admin | admin@example.com | CHANGE_ME |
| User  | user@example.com  | CHANGE_ME |

### Login Steps

1. Navigate to `/login`
2. Enter email and password from the test accounts table
3. Click the submit button
4. Verify redirect to `/dashboard` or home page

### Auth Files

- `src/auth/withAuth.ts`
- `src/auth/jwt.service.ts`
- `src/middleware/auth.middleware.ts`

## Roles

- `admin`
- `Engineer`
- `CEO`
- `CTO`
- `Researcher`

## Navigation Map

### Admin Collections

| Collection    | Path                               | Key Fields                                                                                                                                     |
| ------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Assignments   | `/admin/collections/assignments`   | title, module, instructions, dueDate, maxScore, rubric, criterion, maxPoints, description                                                      |
| Certificates  | `/admin/collections/certificates`  | student, course, issuedAt, certificateNumber, finalGrade                                                                                       |
| Courses       | `/admin/collections/courses`       | title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label, maxEnrollments, quizWeight, assignmentWeight |
| Enrollments   | `/admin/collections/enrollments`   | student, course, enrolledAt, status, completedAt, completedLessons                                                                             |
| Lessons       | `/admin/collections/lessons`       | title, course, module, order, type, content, videoUrl, estimatedMinutes                                                                        |
| Media         | `/admin/collections/media`         | alt                                                                                                                                            |
| Modules       | `/admin/collections/modules`       | title, course, order, description                                                                                                              |
| Notes         | `/admin/collections/notes`         | title, content, tags                                                                                                                           |
| Notifications | `/admin/collections/notifications` | recipient, type, title, message, link, isRead                                                                                                  |
| Quiz Attempts | `/admin/collections/quiz-attempts` | user, quiz, score, passed, answers, questionIndex, answer, startedAt, completedAt                                                              |
| Quizzes       | `/admin/collections/quizzes`       | title, module, order, passingScore, timeLimit, maxAttempts, questions, text, type, options, isCorrect, correctAnswer, points                   |
| Submissions   | `/admin/collections/submissions`   | assignment, student, content, attachments, file, submittedAt, status, grade, feedback, rubricScores, criterion, score, comment                 |
| Users         | `/admin/collections/users`         | firstName, lastName, displayName, avatar, bio, role, organization, refreshToken, tokenExpiresAt, lastTokenUsedAt                               |

### Frontend Pages

| Path                           | Content           | Interactions                                |
| ------------------------------ | ----------------- | ------------------------------------------- |
| `/`                            | Home/landing page | Verify hero, navigation, course listings    |
| `/dashboard`                   | User dashboard    | Verify enrolled courses, recent activity    |
| `/instructor/courses/:id/edit` | Course editor     | Edit course details, manage modules/lessons |
| `/notes`                       | Notes list        | List all notes, search/filter               |
| `/notes/create`                | Create note       | Fill title, content, tags                   |
| `/notes/:id`                   | View note         | Display note content                        |
| `/notes/edit/:id`              | Edit note         | Modify existing note                        |

### API Endpoints

| Path                         | Methods   | Purpose                    |
| ---------------------------- | --------- | -------------------------- |
| `/api/notes`                 | GET, POST | Note CRUD with search      |
| `/api/notes/[id]`            | GET       | Single note retrieval      |
| `/api/quizzes/[id]`          | GET       | Quiz retrieval             |
| `/api/quizzes/[id]/submit`   | POST      | Quiz grading               |
| `/api/quizzes/[id]/attempts` | GET       | User's quiz attempts       |
| `/api/courses/search`        | GET       | Course search with filters |
| `/api/enroll`                | POST      | Enrollment endpoint        |
| `/api/gradebook/course/[id]` | GET       | Grades per course          |

## Required Environment Variables

- `DATABASE_URL`
- `PAYLOAD_SECRET`

## Dev Server

- **Command:** `pnpm dev`
- **URL:** `http://localhost:3000`
