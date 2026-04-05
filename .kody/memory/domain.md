## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer), `Media`, `Course`, `Module`, `Lesson`, `Enrollment`, `EnrollmentStore`, `Note`, `Quiz`, `QuizAttempt`, `Assignment`, `Submission`, `Discussion`, `DiscussionPost`, `Certificate`, `Task`, `NotificationsStore`

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search
- `GET/POST /api/notes/[id]` — Single note retrieval/update
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `QuizGrader`
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService`
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)
- `GET/POST /api/discussions` — Discussion posts
- `POST /api/tasks` — Task creation
- `GET/PATCH/DELETE /api/tasks/[id]` — Task CRUD

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `QuizResult`, `AssignmentResult`, `Enrollment`, `Certificate`, `CertificateNumber`, `Module`, `Task`, `TaskStatus`, `TaskPriority`, `DiscussionPost`, `RichTextContent`, `PayloadGradebookService`, `CourseSearchService`, `NotesStore`, `DiscussionsStore`, `ModuleStore`, `TaskStore`, `EnrollmentStore`
