# QA Guide

## Quick Reference

- **Dev server:** `pnpm dev`
- **URL:** http://localhost:3000
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

- `src/auth`

## Roles

- `admin`
- `Engineer`
- `CEO`
- `CTO`
- `Researcher`

## Navigation Map

### Admin Collections

#### `/admin/collections/assignments`

- **Name:** Assignments
- **Fields:** title, module, instructions, dueDate, maxScore, rubric, criterion, maxPoints, description

#### `/admin/collections/courses`

- **Name:** Courses
- **Fields:** title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label

#### `/admin/collections/enrollments`

- **Name:** Enrollments
- **Fields:** student, course, enrolledAt, status, completedAt, completedLessons

#### `/admin/collections/lessons`

- **Name:** Lessons
- **Fields:** title, course, module, order, type, content, videoUrl, estimatedMinutes

#### `/admin/collections/media`

- **Name:** Media
- **Fields:** alt

#### `/admin/collections/modules`

- **Name:** Modules
- **Fields:** title, course, order, description

#### `/admin/collections/notifications`

- **Name:** Notifications
- **Fields:** recipient, type, title, message, link, isRead

#### `/admin/collections/quiz-attempts`

- **Name:** QuizAttempts
- **Fields:** user, quiz, score, passed, answers, questionIndex, answer, startedAt, completedAt

#### `/admin/collections/quizzes`

- **Name:** Quizzes
- **Fields:** title, module, order, passingScore, timeLimit, maxAttempts, questions, text, type, options

#### `/admin/collections/submissions`

- **Name:** Submissions
- **Fields:** assignment, student, content, attachments, file, submittedAt, status, grade, feedback, rubricScores

#### `/admin/collections/users`

- **Name:** Users
- **Fields:** firstName, lastName, displayName, avatar, bio, role, organization, refreshToken, tokenExpiresAt, lastTokenUsedAt

#### `/admin/collections/certificates`

- **Name:** Certificates
- **Fields:** student, course, issuedAt, certificateNumber, finalGrade

#### `/admin/collections/notes`

- **Name:** Notes
- **Fields:** title, content, tags

### Frontend Pages

| Path                           | Expected Content | Key Interactions                        |
| ------------------------------ | ---------------- | --------------------------------------- |
| `/`                            | Home page        | Verify navigation, hero content         |
| `/dashboard`                   | User dashboard   | Check enrolled courses, recent activity |
| `/instructor/courses/:id/edit` | Course editor    | Edit course details, manage lessons     |
| `/notes`                       | Notes list       | List, search notes                      |
| `/notes/:id`                   | Note detail      | View note content                       |
| `/notes/create`                | Create note      | Fill title, content, tags               |
| `/notes/edit/:id`              | Edit note        | Modify and save note                    |

### API Endpoints

| Path                        | Methods   | Purpose               |
| --------------------------- | --------- | --------------------- |
| `/api/notes`                | GET, POST | Note CRUD with search |
| `/api/notes/:id`            | GET       | Single note retrieval |
| `/api/quizzes/:id`          | GET       | Quiz retrieval        |
| `/api/quizzes/:id/submit`   | POST      | Quiz grading          |
| `/api/quizzes/:id/attempts` | GET       | User's quiz attempts  |
| `/api/courses/search`       | GET       | Course search         |
| `/api/enroll`               | POST      | Enrollment            |
| `/api/gradebook/course/:id` | GET       | Grades per course     |

## Common Test Scenarios

### Admin Workflows

1. **Create Course:** Navigate to `/admin/collections/courses` → click "Create" → fill title, slug, description → set status → save
2. **Add Lesson:** Open course → navigate to modules → add lesson with title, type, content
3. **Review Submission:** Go to `/admin/collections/submissions` → select submission → view content, add grade/feedback

### Frontend Workflows

1. **User Login:** POST credentials to `/login` → verify JWT cookie → access `/dashboard`
2. **Browse Notes:** Visit `/notes` → search → click note → view details
3. **Take Quiz:** Start quiz → answer questions → submit → view score

## Environment Setup

Required env vars:

- `DATABASE_URL`
- `PAYLOAD_SECRET`

## Dev Server

```bash
pnpm dev
```

- **URL:** http://localhost:3000

## Rules

- Be SPECIFIC to this project — reference actual URLs, collection names, component names
- For admin panels (Payload CMS), include the exact `/admin/collections/{slug}` paths
- Include visual assertions: "you should see X", "verify Y is visible"
- Include interaction tests: "click button X", "fill field Y", "drag item Z"
- Keep under 200 lines total
