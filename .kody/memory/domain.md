## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest), `Media`, `Course`, `Module`, `Lesson`, `Enrollment`, `Note`, `Quiz`, `QuizAttempt`, `Notification` (`NotificationSeverity`: info/warning/error)

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `QuizGrader`
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService`
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility. Users table has `lastLogin` and `permissions` columns (migration: `20260405_000000_add_users_permissions_lastLogin`)

**Schema/Validation:** `SchemaError`, `StringSchema`, `NumberSchema`, `BooleanSchema` in `src/utils/schema.ts` (mini-Zod builder)

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `QuizAttempt`, `PayloadGradebookService`, `CourseSearchService`, `Notification`, `NotificationFilter`
