# Conventions

## Payload CMS Patterns

- Always cast `relationTo` with `as CollectionSlug` (see `src/collections/certificates.ts`)
- Run `payload generate:types` after any schema change
- Run `payload generate:importmap` after creating/modifying components
- Always pass `req` to nested operations in hooks (transaction safety)
- Local API bypasses access control — never use it for user-facing operations without explicit access checks
- Roles saved to JWT via `saveToJWT: true` for fast access checks

## Service Layer

- Business logic lives in `src/services/` using dependency injection (constructor injection)
- Services receive stores, checkers, and async getters as constructor params (see `DiscussionService`)
- Never call DB directly from route handlers — go through service layer

## Security

- All user input passes through `src/security/sanitizers.ts` (`sanitizeHtml`, `sanitizeSql`, `sanitizeUrl`)
- No hardcoded secrets — env vars only (`PAYLOAD_SECRET`, `DATABASE_URL`)
- Rate limiting middleware applied globally

## TypeScript

- Strict mode enabled, ESM only (`"type": "module"`)
- Path alias: `@/*` → `src/*`, `@payload-config` → `src/payload.config.ts`
- Target ES2022

## Code Style

- Immutable updates (spread operator, no mutation)
- No `console.log` in production code
- Zod for schema validation at boundaries
- Files < 800 lines, functions < 50 lines
