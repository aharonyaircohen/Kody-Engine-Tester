# QA Guide

## Quick Reference

- Dev server: `pnpm dev` at http://localhost:3000
- Login page: `/login`
- Admin panel: `/admin`

## Authentication

### Test Accounts

| Role       | Email                    | Password                    |
| ---------- | ------------------------ | --------------------------- |
| Admin      | QA_ADMIN_EMAIL (env var) | QA_ADMIN_PASSWORD (env var) |
| Engineer   | QA_ENGINEER_EMAIL        | QA_ENGINEER_PASSWORD        |
| CEO        | QA_CEO_EMAIL             | QA_CEO_PASSWORD             |
| CTO        | QA_CTO_EMAIL             | QA_CTO_PASSWORD             |
| Researcher | QA_RESEARCHER_EMAIL      | QA_RESEARCHER_PASSWORD      |

### Login Steps

1. Navigate to `/login`
2. Enter email and password from test accounts table
3. Submit the form
4. Verify redirect to `/dashboard`

### Auth Files

- `src/auth/` — Auth service and JWT handling
- `src/middleware/auth.ts` — Auth middleware
- `src/middleware/role-guard.ts` — Role-based access control

## Navigation Map

### Admin Panel

| Collection    | URL                                | Key Fields                                                                                          | Components                                             |
| ------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Assignments   | `/admin/collections/assignments`   | title, module, instructions, dueDate, maxScore, rubric, criterion, maxPoints, description           | —                                                      |
| Courses       | `/admin/collections/courses`       | title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label    | CourseLessonsSorter (drag-sortable lessons by chapter) |
| Enrollments   | `/admin/collections/enrollments`   | student, course, enrolledAt, status, completedAt, completedLessons                                  | —                                                      |
| Lessons       | `/admin/collections/lessons`       | title, course, module, order, type, content, videoUrl, estimatedMinutes                             | —                                                      |
| Media         | `/admin/collections/media`         | alt                                                                                                 | —                                                      |
| Modules       | `/admin/collections/modules`       | title, course, order, description                                                                   | —                                                      |
| Notifications | `/admin/collections/notifications` | recipient, type, title, message, link, isRead                                                       | —                                                      |
| Quiz Attempts | `/admin/collections/quiz-attempts` | user, quiz, score, passed, answers, startedAt, completedAt                                          | —                                                      |
| Quizzes       | `/admin/collections/quizzes`       | title, module, order, passingScore, timeLimit, maxAttempts, questions, text, type, options          | —                                                      |
| Submissions   | `/admin/collections/submissions`   | assignment, student, content, attachments, file, submittedAt, status, grade, feedback, rubricScores | —                                                      |
| Users         | `/admin/collections/users`         | firstName, lastName, displayName, avatar, bio, role, organization                                   | —                                                      |
| Certificates  | `/admin/collections/certificates`  | student, course, issuedAt, certificateNumber, finalGrade                                            | —                                                      |
| Notes         | `/admin/collections/notes`         | title, content, tags                                                                                | —                                                      |

### Frontend Pages

| Route                          | Expected Content  | Key Interactions                            |
| ------------------------------ | ----------------- | ------------------------------------------- |
| `/`                            | Landing/home page | Navigation to login, courses                |
| `/dashboard`                   | User dashboard    | View enrolled courses, progress             |
| `/instructor/courses/:id/edit` | Course editor     | Edit course details, manage lessons/modules |
| `/notes`                       | Notes list        | List notes, search                          |
| `/notes/:id`                   | Note detail       | View note content                           |
| `/notes/create`                | Create note form  | Fill title, content, tags, submit           |
| `/notes/edit/:id`              | Edit note form    | Modify and save note                        |

### API Endpoints

| Path                        | Methods          | Purpose                          |
| --------------------------- | ---------------- | -------------------------------- |
| `/api/notes`                | GET, POST        | Note CRUD with search            |
| `/api/notes/:id`            | GET, PUT, DELETE | Single note operations           |
| `/api/quizzes/:id`          | GET              | Quiz retrieval                   |
| `/api/quizzes/:id/submit`   | POST             | Quiz grading                     |
| `/api/quizzes/:id/attempts` | GET              | User's quiz attempts             |
| `/api/courses/search`       | GET              | Course search with filters       |
| `/api/enroll`               | POST             | Course enrollment                |
| `/api/gradebook/course/:id` | GET              | Grades per course (editor/admin) |

## Component Verification Patterns

- **CourseLessonsSorter**: Navigate to `/admin/collections/courses` → open a course → verify drag-sortable lesson list grouped by module/chapter
- **Admin Collection Forms**: Navigate to any `/admin/collections/:name` → verify form fields match collection schema → test save/cancel actions
- **Note Editor**: Navigate to `/notes/create` or `/notes/edit/:id` → verify title, content, tags fields → test save

## Common Test Scenarios

1. **Login Flow**: Visit `/login` → authenticate → verify redirect to `/dashboard`
2. **Admin CRUD**: Login as admin → navigate to collection → create record → edit → delete
3. **Course Enrollment**: Login as Engineer → browse courses → enroll → verify on dashboard
4. **Note CRUD**: Login → navigate `/notes` → create note → edit → verify changes persist
5. **Quiz Submission**: Navigate to quiz → answer questions → submit → verify score/feedback
6. **Role Access**: Verify CEO/CTO/Researcher roles see correct data based on RBAC

## Environment Setup

```
DATABASE_URL=postgresql://...
PAYLOAD_SECRET=<secret>
QA_ADMIN_EMAIL=admin@example.com
QA_ADMIN_PASSWORD=<password>
QA_ENGINEER_EMAIL=engineer@example.com
QA_ENGINEER_PASSWORD=<password>
QA_CEO_EMAIL=ceo@example.com
QA_CEO_PASSWORD=<password>
QA_CTO_EMAIL=cto@example.com
QA_CTO_PASSWORD=<password>
QA_RESEARCHER_EMAIL=researcher@example.com
QA_RESEARCHER_PASSWORD=<password>
```

## Dev Server

```bash
pnpm dev
# Runs at http://localhost:3000
```

## Rules

- All credentials must come from environment variables — no hardcoded values
- Test admin routes require admin role authentication
- Use `Authorization: Bearer ${token}` header with JWT for API calls
- Admin panel is Payload CMS — wait for form loads before interactions
- Frontend uses Next.js — wait for page hydration before assertions
