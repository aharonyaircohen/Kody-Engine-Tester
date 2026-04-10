# QA Guide

## Quick Reference

- Dev server: `pnpm dev` at http://localhost:3000
- Login page: /login
- Admin panel: /admin/... (Payload CMS 3.80.0)

## Authentication

### Test Accounts

| Role  | Email             | Password             |
| ----- | ----------------- | -------------------- |
| Admin | ${QA_ADMIN_EMAIL} | ${QA_ADMIN_PASSWORD} |

### Login Steps

1. Navigate to /login
2. Enter credentials from test accounts table
3. Submit the login form
4. Verify redirect to /dashboard or home page

### Auth Files

- src/auth/withAuth.ts
- src/auth/session.ts
- src/auth/jwt.ts

## Navigation Map

### Admin Collections (Payload CMS)

| Collection    | Admin URL                        | Key Fields                                                                                                                     |
| ------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Assignments   | /admin/collections/assignments   | title, module, instructions, dueDate, maxScore, rubric, criterion, maxPoints, description                                      |
| Certificates  | /admin/collections/certificates  | student, course, issuedAt, certificateNumber, finalGrade                                                                       |
| Courses       | /admin/collections/courses       | title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label                               |
| Enrollments   | /admin/collections/enrollments   | student, course, enrolledAt, status, completedAt, completedLessons                                                             |
| Lessons       | /admin/collections/lessons       | title, course, module, order, type, content, videoUrl, estimatedMinutes                                                        |
| Media         | /admin/collections/media         | alt                                                                                                                            |
| Notes         | /admin/collections/notes         | title, content, tags                                                                                                           |
| Notifications | /admin/collections/notifications | recipient, type, title, message, link, isRead                                                                                  |
| Quiz Attempts | /admin/collections/quiz-attempts | user, quiz, score, passed, answers, questionIndex, answer, startedAt, completedAt                                              |
| Quizzes       | /admin/collections/quizzes       | title, module, order, passingScore, timeLimit, maxAttempts, questions, text, type, options, isCorrect, correctAnswer, points   |
| Submissions   | /admin/collections/submissions   | assignment, student, content, attachments, file, submittedAt, status, grade, feedback, rubricScores, criterion, score, comment |
| Users         | /admin/collections/users         | firstName, lastName, displayName, avatar, bio, role, organization, refreshToken, tokenExpiresAt, lastTokenUsedAt               |

### Frontend Pages

| Route                        | Purpose        | Key Interactions                                      |
| ---------------------------- | -------------- | ----------------------------------------------------- |
| /                            | Homepage       | Hero, navigation visible                              |
| /dashboard                   | User dashboard | Enrolled courses, progress                            |
| /instructor/courses/:id/edit | Course editor  | Edit title, slug, description, manage modules/lessons |
| /notes                       | Notes list     | List view of notes                                    |
| /notes/:id                   | Note detail    | View note content                                     |
| /notes/create                | Create note    | Form: title, content, tags                            |
| /notes/edit/:id              | Edit note      | Pre-filled form                                       |

### API Endpoints

| Endpoint                  | Methods   | Purpose                           |
| ------------------------- | --------- | --------------------------------- |
| /api/notes                | GET, POST | Note CRUD with search             |
| /api/courses/search       | GET       | Course search                     |
| /api/enroll               | POST      | Enrollment (viewer role required) |
| /api/gradebook/course/:id | GET       | Grades per course                 |

## Component Verification Patterns

### Admin Components

- **CourseLessonsSorter**: Drag-sortable lessons grouped by chapter on /instructor/courses/:id/edit
- **LessonEditor**: Rich text editor for lesson content
- **QuizBuilder**: Add/edit questions with options, isCorrect, correctAnswer, points

### Frontend Components

- **NoteCard**: Displays note title, excerpt, tags
- **CourseCard**: Displays course thumbnail, title, instructor

## Common Test Scenarios

### Login Flow

1. Navigate to /login
2. Fill email and password fields
3. Click submit button
4. Verify redirect to /dashboard
5. Verify user menu shows correct role (admin/Engineer/CEO/CTO/Researcher)

### CRUD: Notes

1. Create: Navigate to /notes/create, fill title/content/tags, submit
2. Read: Navigate to /notes/:id, verify content displayed
3. Update: Navigate to /notes/edit/:id, modify fields, save
4. Verify changes reflected in /notes list

### Admin: Course Management

1. Navigate to /admin/collections/courses
2. Click "Create" button
3. Verify form with title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label fields
4. Add modules and lessons
5. Publish and verify on /instructor/courses/:id/edit

### Admin: Quiz Management

1. Navigate to /admin/collections/quizzes
2. Create quiz with title, passingScore, timeLimit, maxAttempts
3. Add questions with text, type, options, isCorrect, correctAnswer, points

## Environment Setup

Required env vars:

- DATABASE_URL
- PAYLOAD_SECRET

## Dev Server

- Command: `pnpm dev`
- URL: http://localhost:3000

## Roles

- admin
- Engineer
- CEO
- CTO
- Researcher
