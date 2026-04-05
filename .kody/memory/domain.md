## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest), `Media`, `Course`, `Lesson`, `Enrollment`, `Note`, `Quiz`, `QuizAttempt`, `Notification` (severity: info/warning/error, isRead, link)

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search
- `GET/POST /api/notes/[id]` — Note by ID with HTML sanitization via `sanitizeHtml`
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `QuizGrader`
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService` (sort: relevance/newest/popularity/rating, difficulty: beginner/intermediate/advanced)
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility

**Database Schema:** `users` (id, email, hash, salt, reset_password_token, login_attempts, lock_until, lastLogin, permissions), `users_sessions`, `media`, `payload_kv`, `payload_locked_documents`

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `PayloadGradebookService`, `CourseSearchService`, `Notification`, `NotificationFilter`, `NotificationSeverity`
