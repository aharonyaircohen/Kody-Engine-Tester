## Learned 2026-04-18 (task: conventions)

**CSS Modules**: Use `styles from './ModuleList.module.css'` pattern for component-scoped styling (see `src/components/course-editor/ModuleList.tsx`)

**Service Layer**: Business logic in `src/services/` as classes with constructor dependency injection (see `src/services/discussions.ts:DiscussionService`)

**Security Utilities**: Input sanitization in `src/security/sanitizers.ts` — `sanitizeHtml`, `sanitizeSql`, `sanitizeUrl` for XSS/SQLi/path traversal prevention

**Store Pattern**: In-memory stores using `private Map` for domain objects with helper methods (see `src/collections/certificates.ts:CertificatesStore`)

**Context + Hooks Pattern**: `useContext(AuthContext)` with `ProtectedRoute` wrapper for auth-guarded pages (see `src/pages/auth/profile.tsx`)

**Drag-and-Drop**: HTML5 `dataTransfer` API with `e.dataTransfer.setData/getData` for module reordering (see `src/components/course-editor/ModuleList.tsx:handleDragStart`)

**HTML Entity Decoding**: Manual map-based decoding for HTML entities in `src/security/sanitizers.ts`
