## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest), `Media`, `Course`, `Lesson`, `Enrollment`, `Note`, `Quiz`, `QuizAttempt`, `Notification`

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `QuizGrader`
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService`
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `PayloadGradebookService`, `CourseSearchService`, `Notification`, `NotificationSeverity`, `NotificationFilter`

**Schema/Validation:** `Schema<T>` base class with `StringSchema`, `NumberSchema`, `BooleanSchema` in `src/utils/schema.ts`; `SchemaError` for validation failures

**Migrations:** Timestamp-named migrations in `src/migrations/` (e.g., `20260322_233123_initial`, `20260405_000000_add_users_permissions_lastLogin`) using `@payloadcms/db-postgres` sql template tags

**Key Constants:** `VALID_SORT_OPTIONS` ('relevance'|'newest'|'popularity'|'rating'), `VALID_DIFFICULTIES` ('beginner'|'intermediate'|'advanced'), `MAX_LIMIT` (100), `DEFAULT_LIMIT` (10) in `src/app/api/courses/search/route.ts`
