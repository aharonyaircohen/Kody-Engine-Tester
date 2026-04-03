# Conventions

## TypeScript

- Strict mode enabled; no `any`, use proper Payload types
- ESM only (`"type": "module"`), `ES2022` target
- Path alias: `@/*` → `src/*`, `@payload-config` → `src/payload.config.ts`
- Run `pnpm generate:types` after every schema change
- Run `pnpm generate:importmap` after creating/modifying components
- Validate with `tsc --noEmit` before committing

## Payload CMS Patterns

- Cast `relationTo` as `CollectionSlug`: `relationTo: 'users' as CollectionSlug`
- Always pass `req` to nested operations in hooks (transaction safety)
- Local API bypasses access control — use REST API for user-facing ops
- Ensure roles exist when modifying access-controlled collections/globals

## Service Layer

- Business logic lives in `src/services/`, not in collection hooks
- Dependency injection via constructor: `new DiscussionService(store, enrollmentStore, getUser, checker)`
- Services accept store interfaces, not direct DB calls

## Security

- All user input passes through `src/security/sanitizers.ts` utilities
- Use `sanitizeHtml`, `sanitizeSql`, `sanitizeUrl` at system boundaries
- No hardcoded secrets — use env vars, validated at startup

## Code Style

- Immutable updates only (spread operator, no mutation)
- No `console.log` in production code
- Files under 800 lines; prefer many small focused files
- No nested metadata in Payload records (flat structure only)

## Learned 2026-04-03 (task: 351-260403-202137)
- Uses vitest for testing
- Uses eslint for linting
- Active directories: src/utils
