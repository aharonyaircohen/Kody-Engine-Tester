## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest/student/instructor), `Media`, `Course`, `Module`, `Lesson`, `Enrollment`, `Certificate`, `Assignment`, `Submission`, `Note`, `Quiz`, `QuizAttempt`, `Notification`

**Database Schema:** `users` (id, email, hash, salt, reset_token, login_attempts, lock_until, lastLogin, permissions), `users_sessions`, `media`, `courses`, `modules`, `lessons`, `enrollments`, `certificates`, `assignments`, `submissions`, `quizzes`, `quiz_attempts`, `notifications`, `notes`, `payload_kv`, `payload_locked_documents`

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → Middleware (auth/role/rate-limit) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes`, `GET/PUT/DELETE /api/notes/[id]` — Note CRUD with search, sanitized via `sanitizeHtml`
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `gradeQuiz`
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService`, supports difficulty/tags/sort pagination
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)

**Auth Architecture:** JWT via Payload built-in, `withAuth` HOC wraps routes, RBAC via `checkRole` (roles: `admin`, `editor`, `viewer`, `guest`), CSRF and rate-limiting middleware enabled

**Key Types:** `Notification` (`NotificationSeverity = 'info'|'warning'|'error'`, `NotificationFilter`), `Note`, `Quiz`, `QuizAnswer`, `QuizAttempt`, `Config`, `PayloadGradebookService`, `CourseSearchService`, `SortOption`
