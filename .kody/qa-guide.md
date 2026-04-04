# QA Guide

## Authentication

### Test Accounts

<!-- Fill in your test/preview environment credentials below -->

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

- `src/auth`

## Roles

- `admin`
- `Engineer`
- `CEO`
- `CTO`
- `Researcher`

## Key Pages

### Frontend

- `/`
- `/dashboard`
- `/instructor/courses/:id/edit`
- `/notes`
- `/notes/:id`
- `/notes/create`
- `/notes/edit/:id`

### Admin

- `/admin/:...segments?`

## Admin Collections

### `/admin/collections/assignments`

- **Name:** Assignments
- **Fields:** title, module, instructions, dueDate, maxScore, rubric, criterion, maxPoints, description

### `/admin/collections/courses`

- **Name:** Courses
- **Fields:** title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label, maxEnrollments, quizWeight, assignmentWeight

### `/admin/collections/enrollments`

- **Name:** Enrollments
- **Fields:** student, course, enrolledAt, status, completedAt, completedLessons

### `/admin/collections/lessons`

- **Name:** Lessons
- **Fields:** title, course, module, order, type, content, videoUrl, estimatedMinutes

### `/admin/collections/media`

- **Name:** Media
- **Fields:** alt

### `/admin/collections/notifications`

- **Name:** Notifications
- **Fields:** recipient, type, title, message, link, isRead

### `/admin/collections/quiz-attempts`

- **Name:** QuizAttempts
- **Fields:** user, quiz, score, passed, answers, questionIndex, answer, startedAt, completedAt

### `/admin/collections/quizzes`

- **Name:** Quizzes
- **Fields:** title, module, order, passingScore, timeLimit, maxAttempts, questions, text, type, options, isCorrect, correctAnswer, points

### `/admin/collections/submissions`

- **Name:** Submissions
- **Fields:** assignment, student, content, attachments, file, submittedAt, status, grade, feedback, rubricScores, criterion, score, comment

### `/admin/collections/users`

- **Name:** Users
- **Fields:** firstName, lastName, displayName, avatar, bio, role, organization, refreshToken, tokenExpiresAt, lastTokenUsedAt

### `/admin/collections/certificates`

- **Name:** certificates
- **Fields:** student, course, issuedAt, certificateNumber, finalGrade

### `/admin/collections/notes`

- **Name:** notes
- **Fields:** title, content, tags

## Required Environment Variables

- `DATABASE_URL`
- `PAYLOAD_SECRET`

## Dev Server

- Command: `pnpm dev`
- URL: `http://localhost:3000`
