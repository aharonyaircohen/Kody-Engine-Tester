# Conventions

## Payload Collections

- Always cast slugs: `relationTo: 'users' as CollectionSlug`
- Run `payload generate:types` after schema changes
- Run `payload generate:importmap` after creating/modifying components
- Validate with `tsc --noEmit` after edits

## Service Layer

- Dependency injection via constructor: `constructor(private store: XStore, private enrollmentStore: EnrollmentStore, ...)`
- Pass `req` to nested Payload operations in hooks for transaction safety

## Security

- Use `src/security/sanitizers.ts` for all user input: `sanitizeHtml`, `sanitizeSql`, `sanitizeUrl`
- Never bypass access control unless using Local API intentionally
- Rate limiting middleware applied globally

## TypeScript

- Strict mode enforced; no `any` unless unavoidable
- Path aliases: `@/*` → `src/*`, `@payload-config` → `src/payload.config.ts`
- ESM only (`"type": "module"`)

## Testing

- E2E tests use shared auth helpers (`tests/e2e/helpers/login.ts`, `seedUser.ts`)
- Screenshot captures stored in `tests/e2e/screenshots/`
- Admin nav links: `a[href*="/admin/collections/{slug}"]`

## Code Style

- Immutable updates (spread operator, no mutation)
- No `console.log` in production code
- Functions < 50 lines, files < 800 lines
