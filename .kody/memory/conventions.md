## Learned 2026-04-18 (SDLC pipeline conventions)

- Collections use singular slugs: `slug: 'certificates'` (see `src/collections/certificates.ts`)
- CSS Modules: `*.module.css` files use kebab-case (e.g., `ModuleList.module.css` imported as `styles`)
- Services receive store dependencies via constructor injection (e.g., `DiscussionService` takes `store`, `enrollmentStore`, `getUser`, `enrollmentChecker`)
- Utility functions use async/await with `crypto.subtle` for Web Crypto API (SHA-256 hashing in `src/utils/url-shortener.ts`)
- Sanitizers return early with empty string for invalid input (`sanitizeUrl`, `sanitizeSql`, `sanitizeHtml` in `src/security/sanitizers.ts`)
- Page components use default exports; route handlers and services use named exports
- Interfaces for input types are prefixed (e.g., `UpdateLessonInput`, `IssueCertificateInput`, `UrlShortenerOptions`)
