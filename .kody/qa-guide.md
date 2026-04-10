# QA Guide

## Quick Reference

- **Dev server command:** `pnpm dev`
- **Dev server URL:** http://localhost:3000
- **Login page URL:** `/login`
- **Admin panel URL:** `/admin` ( Payload CMS 3.80.0)

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

### Admin Panel

| Collection    | URL                                | Expected Content                                           |
| ------------- | ---------------------------------- | ---------------------------------------------------------- |
| Assignments   | `/admin/collections/assignments`   | List view with title, module, dueDate columns              |
| Courses       | `/admin/collections/courses`       | Grid/list with title, slug, instructor, status fields      |
| Enrollments   | `/admin/collections/enrollments`   | Table with student, course, status columns                 |
| Lessons       | `/admin/collections/lessons`       | List with title, course, module, order, type fields        |
| Media         | `/admin/collections/media`         | Upload/management interface                                |
| Modules       | `/admin/collections/modules`       | List with title, course, order fields                      |
| Notifications | `/admin/collections/notifications` | Table with recipient, type, isRead columns                 |
| Quiz Attempts | `/admin/collections/quiz-attempts` | Table with user, quiz, score, passed columns               |
| Quizzes       | `/admin/collections/quizzes`       | List with title, module, passingScore, timeLimit fields    |
| Submissions   | `/admin/collections/submissions`   | Table with assignment, student, status, grade columns      |
| Users         | `/admin/collections/users`         | Table with firstName, lastName, role, organization columns |
| Certificates  | `/admin/collections/certificates`  | List with student, course, certificateNumber, finalGrade   |
| Notes         | `/admin/collections/notes`         | List with title, content, tags fields                      |

### Frontend Pages

| Route                          | Expected Content                                                                                                                                                  | Key Interactions                      |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `/`                            | Home page with course listings or landing content                                                                                                                 | Navigation links, course cards        |
| `/dashboard`                   | User dashboard with enrollments, progress                                                                                                                         | View enrolled courses, access lessons |
| `/instructor/courses/:id/edit` | Course editor with title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label, maxEnrollments, quizWeight, assignmentWeight | Edit fields, save course              |
| `/notes`                       | Notes listing page                                                                                                                                                | Create note button, list of notes     |
| `/notes/create`                | Note creation form                                                                                                                                                | Fill title, content, tags, save       |
| `/notes/:id`                   | Note detail view                                                                                                                                                  | Display note content                  |
| `/notes/edit/:id`              | Note edit form                                                                                                                                                    | Modify and save note                  |

### API Endpoints

| Path                         | Methods   | Purpose                             |
| ---------------------------- | --------- | ----------------------------------- |
| `/api/notes`                 | GET, POST | Note CRUD with search               |
| `/api/notes/[id]`            | GET       | Retrieve note by ID                 |
| `/api/quizzes/[id]`          | GET       | Retrieve quiz                       |
| `/api/quizzes/[id]/submit`   | POST      | Submit quiz answers for grading     |
| `/api/quizzes/[id]/attempts` | GET       | Get user's quiz attempts            |
| `/api/courses/search`        | GET       | Search courses with SortOption      |
| `/api/enroll`                | POST      | Enroll user in course               |
| `/api/gradebook/course/[id]` | GET       | Get course gradebook (editor/admin) |

## Component Verification Patterns

### Admin Collection List Views

- **Navigation:** Click collection name in Payload admin sidebar
- **Verify:** Table headers match expected fields, pagination controls present
- **Interaction:** Click row to edit, use bulk select for bulk actions

### Admin Edit Forms

- **Navigation:** Click item in collection list, or append `/[id]` to collection URL
- **Verify:** All collection fields render as form inputs
- **Interaction:** Modify field, click "Save", verify success toast

### Frontend Note Editor

- **Location:** `/notes/create` or `/notes/edit/:id`
- **Verify:** Title input, content textarea, tags field visible
- **Interaction:** Fill fields, click save button, verify redirect to notes list

### Course Editor (Instructor)

- **Location:** `/instructor/courses/:id/edit`
- **Verify:** Title, slug, description, thumbnail upload, instructor select, status dropdown, difficulty select, estimatedHours, tags input, label input visible
- **Custom Component:** CourseLessonsSorter shows drag-sortable lessons grouped by module

## Common Test Scenarios

### Login Flow

1. Navigate to `/login`
2. Enter admin credentials
3. Submit form
4. Verify redirect to `/dashboard`

### Create Note

1. Login as admin
2. Navigate to `/notes/create`
3. Fill title, content, tags
4. Submit
5. Verify redirect to `/notes` with new note in list

### Edit Course

1. Login as admin
2. Navigate to `/admin/collections/courses`
3. Click a course row
4. Modify title
5. Save and verify changes persist

### Quiz Submission

1. Login as user
2. Navigate to a quiz page
3. Answer questions
4. Submit quiz
5. Verify score displayed

### Enrollment

1. Login as user
2. Navigate to course page
3. Click enroll button
4. Verify enrollment appears in `/dashboard`

## Environment Setup

Required environment variables:

- `DATABASE_URL` — PostgreSQL connection string
- `PAYLOAD_SECRET` — Secret for Payload CMS JWT signing

## Dev Server

- **Command:** `pnpm dev`
- **URL:** http://localhost:3000

## Rules

- Be SPECIFIC to this project — reference actual URLs, collection names, component names
- For admin panels (Payload CMS, etc.), include the exact `/admin/collections/{slug}` paths
- Include visual assertions: "you should see X", "verify Y is visible"
- Include interaction tests: "click button X", "fill field Y", "drag item Z"
- Keep under 200 lines total
