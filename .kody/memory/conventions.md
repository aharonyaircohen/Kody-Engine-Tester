## Learned 2026-04-09 (task: conventions-update)

- Security sanitizers in `src/security/sanitizers.ts`: `sanitizeHtml`, `sanitizeSql`, `sanitizeUrl` for XSS/SQLi/path traversal prevention
- Auth context pattern: `AuthContext` from `@/contexts/auth-context` with `ProtectedRoute` wrapper for protected pages
- Session management: `SessionCard` component, `Session` type from `@/auth/session-store`
- Password handling: `PasswordStrengthBar` component, PATCH to `/api/auth/profile` for password changes
- Stores pattern: Classes like `CertificatesStore`, `DiscussionsStore` using `Map<string, T>` for in-memory state with helper methods
- RichTextContent type imported from `@/collections/Discussions` for discussion posts
- Service dependency injection: `DiscussionService` takes store instances and getter functions in constructor
- Recursion depth guards: `getThreadDepth(postId, postsById, depth)` pattern limits nesting to prevent deep recursion attacks
- CSS Modules: component styles imported as `styles from './ComponentName.module.css'`
