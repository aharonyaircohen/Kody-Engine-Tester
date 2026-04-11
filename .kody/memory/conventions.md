**Naming**: Components/Types → PascalCase; functions/utils → camelCase; files → kebab-case (`.module.css`); collections → singular slug

**Imports**: Use `import type` for types; path alias `@/*` for internal modules; named imports preferred; default import for Node.js built-ins (`crypto`)

```typescript
import type { Module } from '@/collections/Modules'
import type { Lesson, UpdateLessonInput } from '@/collections/Lessons'
import { LessonEditor } from './LessonEditor'
import styles from './ModuleList.module.css'
import crypto from 'crypto'
```

**Exports**: Named exports for utilities/types/classes; default export for page components only

**Error Handling**: async/await with try-catch; `.catch(() => {})` for non-critical fallbacks (see `src/pages/auth/profile.tsx:27`)

**File Organization**: Single-responsibility utils in `src/utils/`; business logic in `src/services/`; Payload configs in `src/collections/`; React components in `src/components/`; security utilities in `src/security/`; auth stores in `src/auth/`

**Style**: Prettier singleQuote, trailingComma=all, printWidth=100, semi=false; ESLint strict TypeScript; `'use client'` directive on all client components

**Store Pattern**: In-memory stores (e.g., `CertificatesStore`, `EnrollmentStore`) use private `Map` fields; expose public methods for data access; related interfaces co-located in same file (see `src/collections/certificates.ts`)

**Service Pattern**: Services receive store dependencies via constructor injection; helper functions defined outside class for reusability (see `src/services/discussions.ts:6`)

**Type Co-location**: Input types (e.g., `UpdateLessonInput`, `IssueCertificateInput`) and result types (e.g., `ShortCodeResult`) defined alongside their corresponding function/class in the same file

**Security Utilities**: Sanitizers for HTML, SQL, and URLs in `src/security/sanitizers.ts`; HTML entity decoding via lookup map; `sanitizeUrl` rejects `javascript:`/`data:` protocols and validates relative paths start with `/`
