## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest/instructor), `Media`, `Course`, `Module`, `Lesson`, `Enrollment`, `Note`, `Quiz`, `QuizAttempt`, `Certificate`, `Notification` (severity: info/warning/error)

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search (uses `sanitizeHtml`)
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `QuizGrader`
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — `CourseSearchService` (sort: relevance/newest/popularity/rating; filters: difficulty, tags)
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — `PayloadGradebookService` grades per course

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `Notification`, `NotificationSeverity`, `NotificationFilter`, `PayloadGradebookService`, `CourseSearchService`, `SortOption`

**Schema Utilities:** `Schema<T>` base class, `StringSchema`, `NumberSchema`, `BooleanSchema`, `SchemaError` in `src/utils/schema.ts` (mini-Zod type inference)

**Migrations:** `20260322_233123_initial` (users, media, sessions tables), `20260405_add_users_permissions_lastLogin` (adds `lastLogin` timestamp and `permissions` text[] to users)
