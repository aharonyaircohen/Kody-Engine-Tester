## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest/student/instructor), `Media`, `Course`, `Module`, `Lesson`, `Enrollment`, `Certificate`, `Assignment`, `Submission`, `Note`, `Quiz`, `QuizAttempt`, `Notification`, `Discussion`

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `QuizGrader`
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService`
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)
- `GET/POST /api/notifications`, `POST /api/notifications/[id]/read`, `POST /api/notifications/read-all` — Notifications with `NotificationSeverity` (info/warning/error)
- `GET /api/dashboard/admin-stats` — Admin statistics
- `GET /api/health` — Health check

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility. Users table extended with `lastLogin` (timestamp) and `permissions` (text array) via migration `20260405_000000_add_users_permissions_lastLogin`.

**Middleware:** `auth-middleware.ts`, `role-guard.ts`, `rate-limiter.ts`, `csrf-middleware.ts`, `request-logger.ts`, `validation.ts`

**Security:** `csrf-token.ts`, `sanitizers.ts` (includes `sanitizeHtml`), `validation-middleware.ts`

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `Notification`, `NotificationSeverity`, `PayloadGradebookService`, `CourseSearchService`, `Certificate`, `Assignment`, `Submission`

**Database Schema:** `users` (id, email, hash, roles, lastLogin, permissions), `users_sessions`, `media`, `courses`, `modules`, `lessons`, `enrollments`, `notes`, `quizzes`, `quiz_attempts`, `notifications`, `assignments`, `submissions`, `certificates`, `discussions`, `payload_kv`, `payload_locked_documents`
