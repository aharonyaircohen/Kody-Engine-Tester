**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility; `sanitizeHtml` from `@/security/sanitizers` applied to user content

**Database Schema:** `users` (id, email, hash, salt, login_attempts, lock_until, lastLogin, permissions), `users_sessions`, `media`, `payload_kv`, `payload_locked_documents`; migrations at `src/migrations/`

**Additional Types:** `Notification` (`NotificationSeverity: info|warning|error`, recipient, isRead), `Schema<T>` base class with `SchemaError`, `StringSchema`, `NumberSchema`, `BooleanSchema` for validation

**Extended API Surface:**

- `GET/POST /api/notes/[id]` — Single Note by ID
- `GET /api/quizzes/[id]/attempts` — User's quiz attempt history
- `CourseSearchService` — Sort by relevance/newest/popularity/rating with difficulty/tag filters
- `gradeQuiz` → `QuizAnswer` grading via `@/services/quiz-grader`

**Services:** `getPayloadInstance`, `PayloadGradebookService`, `CourseSearchService`
