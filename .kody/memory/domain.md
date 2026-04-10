## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer), `Media`, `Course`, `Module`, `Lesson`, `Enrollment`, `Certificate`, `Assignment`, `Submission`, `Discussion`, `Note`, `Quiz`, `QuizAttempt`, `Notification`

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search
- `GET /api/notes/[id]` — Single note retrieval
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `QuizGrader`
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService`
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)
- `GET/POST /api/notifications/*` — Notifications CRUD
- `GET /api/dashboard/admin-stats` — Admin statistics
- `GET /api/health` — Health check
- `GET/POST /api/auth/*` — Login, register, logout, refresh, profile

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility. Middleware stack: `auth-middleware.ts` (JWT validation), `role-guard.ts` (RBAC), `csrf-middleware.ts`, `rate-limiter.ts`, `request-logger.ts`, `validation.ts`

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `PayloadGradebookService`, `CourseSearchService`, `Notification`, `NotificationSeverity`, `NotificationFilter`

**Database Schema:** PostgreSQL with tables: `users` (id, email, hash, login_attempts, lock_until, lastLogin, permissions), `media`, `courses`, `modules`, `lessons`, `enrollments`, `certificates`, `assignments`, `submissions`, `discussions`, `notes`, `quizzes`, `quiz_attempts`, `notifications`, `payload_kv`, `payload_locked_documents`, `users_sessions`

**Key Services:** `auth-service.ts` (RBAC auth), `jwt-service.ts` (JWT tokens), `session-store.ts` (server-side sessions), `quiz-grader.ts` (quiz grading), `course-search.ts` (search/sort/filter), `gradebook-payload.ts` (grade retrieval), `progress.ts` / `course-progress.ts` (tracking)
