## Learned 2026-04-11 (task: conventions-update-261011)

- Service classes in `src/services/` use constructor dependency injection (e.g., `DiscussionService`)
- Security sanitizers in `src/security/sanitizers.ts` use `sanitize` prefix for pure utility functions
- Business logic stores (e.g., `CertificatesStore`, `DiscussionsStore`) live in `src/collections/` alongside Payload configs
- Async utility functions use JSDoc for documentation (see `src/utils/url-shortener.ts:generateShortCode`)
- Error handling: async operations use try-catch; non-critical background operations silently swallow errors with `.catch(() => {})`
- Class-based services export both the class (named export) and related interfaces/types from same file
