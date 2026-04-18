## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/instructor/student), `Organization` (tenant), `Media`, `Course`, `Module`, `Lesson`, `Enrollment`, `Note`, `Quiz`, `QuizAttempt`, `Certificate`, `Gradebook`, `Notification`

**Relationships:** Organization → Users → Enrollments → Courses → Modules → Lessons/Quizzes/Assignments; Organization → Courses → Discussions; Organization → Certificates; User → Notifications

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search via `getPayloadInstance`
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `QuizGrader`
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService` (sort: relevance/newest/popularity/rating; difficulty: beginner/intermediate/advanced)
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course via `PayloadGradebookService` (editor/admin)

**Auth Architecture:** JWT via Payload, `withAuth` HOC wraps routes, RBAC via `checkRole` utility; `sanitizeHtml` from `@/security/sanitizers`

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `QuizAttempt`, `PayloadGradebookService`, `CourseSearchService`, `SortOption`, `Notification`, `NotificationSeverity`, `NotificationFilter`

**Schema/Validation:** Custom `Schema` class in `src/utils/schema.ts` with `SchemaError`, `StringSchema`, `NumberSchema`, `BooleanSchema`; migrations in `src/migrations/` with timestamp-based naming

**Database:** `users` table has `lastLogin` (timestamp), `permissions` (text[]), `login_attempts`, `lock_until` columns per migration `20260405_000000_add_users_permissions_lastLogin`
