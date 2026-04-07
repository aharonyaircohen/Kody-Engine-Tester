## Learned 2026-04-07 (task: conventions-update-260407)

- **Naming**: Components/Types → PascalCase; functions/utils → camelCase; files → kebab-case (`.module.css`); collections → singular slug
- **Imports**: Use `import type` for types; path alias `@/*` for internal modules; named imports preferred
- **Exports**: Named exports for utilities/types; default export for page components only
- **Error Handling**: async/await with try-catch; `.catch(() => {})` for non-critical fallbacks
- **File Organization**: Single-responsibility utils in `src/utils/`; business logic in `src/services/`; Payload configs in `src/collections/`; React components in `src/components/`; security utilities in `src/security/`
- **Style**: Prettier singleQuote, trailingComma=all, printWidth=100, semi=false; ESLint strict TypeScript; `'use client'` directive on all client components
- **Service Pattern**: Constructor-based dependency injection; recursive helpers with depth limits (max 3); type exports alongside service classes
- **Security Utilities**: Dedicated sanitizers for HTML, SQL, URL, and path traversal in `src/security/sanitizers.ts`
- **Collection Configs**: `CollectionConfig` with `slug` and `fields` array; interfaces defined at bottom of same file
- **Store Pattern**: Private `Map`-backed stores with `getByLesson`, `getReplies`, `getById` accessors
- **JSdoc Style**: `@example` blocks for public utilities; `@param` and `@returns` annotations
- **URL Generation**: Deterministic short codes via `crypto.subtle.digest('SHA-256', ...)` with base62 encoding
