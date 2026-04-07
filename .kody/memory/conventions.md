## Learned 2026-04-07 (task: T22)

**Service Layer**: Business logic in `src/services/`; receives store + dependencies via constructor; returns typed interfaces (`DiscussionThread`); uses `Map` for lookups; recursive helpers (`getThreadDepth`)

```typescript
// src/services/discussions.ts
export class DiscussionService {
  constructor(
    private store: DiscussionsStore,
    private enrollmentStore: EnrollmentStore,
    private getUser: (id: string) => Promise<User | undefined>,
    private enrollmentChecker: EnrollmentChecker,
  ) {}
```

**Security Utils**: Sanitization functions in `src/security/sanitizers.ts`; regex-based HTML/SQL/URL stripping; named export per concern

```typescript
// src/security/sanitizers.ts
export function sanitizeHtml(input: string): string { ... }
export function sanitizeSql(input: string): string { ... }
export function sanitizeUrl(input: string): string { ... }
```

**JSDoc Style**: Utils use JSDoc with `@example`, `@param`, `@returns`; async functions documented with full signature

**Class Stores**: Collection data access encapsulated in classes (`CertificatesStore`, `DiscussionsStore`) with private `Map` backing

**Relative Imports**: Page components use relative paths (`../../contexts/auth-context`) vs alias for collections

**Import Style**: `import crypto from 'crypto'` for Node built-ins; `import type { CollectionConfig } from 'payload'` for types
