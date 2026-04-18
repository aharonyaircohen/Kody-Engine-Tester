## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest/student/instructor), `Media`, `Course`, `Module`, `Lesson`, `Enrollment`, `Certificate`, `Assignment`, `Submission`, `Note`, `Quiz`, `QuizAttempt`, `Notification` (`NotificationSeverity`: info | warning | error)

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search; `GET /api/notes/[id]` — single note
- `GET /api/quizzes/[id]` — Quiz retrieval; `POST /api/quizzes/[id]/submit` — Quiz grading via `QuizGrader`; `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService` (params: q, difficulty, tags, sort, page, limit)
- `POST /api/enroll` — Enrollment (viewer role required); requires `{ courseId }` in body
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)
- `GET/POST /api/notifications` — Notification CRUD (based on `NotificationFilter`)

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility

**Database Schema (via migrations):**

- `users` — id, email, hash, salt, reset_password_token, login_attempts, lock_until, lastLogin, permissions
- `users_sessions` — id, created_at, expires_at
- `media` — id, alt, url, thumbnail_u_r_l, filename, mime_type, filesize, width, height, focal_x, focal_y

**Validation:** `Schema<T>` base class with `StringSchema`, `NumberSchema`, `BooleanSchema`; `optional()` and `default()` modifiers; throws `SchemaError`

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `Notification`, `NotificationFilter`, `PayloadGradebookService`, `CourseSearchService`, `SortOption`
