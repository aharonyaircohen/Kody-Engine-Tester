# Conventions

## Payload Collections

- Defined in `src/collections/` as `CollectionConfig` exports
- Always cast relationship `relationTo` with `as CollectionSlug`
- `saveToJWT: true` on role fields for fast access checks
- Always pass `req` to nested Payload operations in hooks (transaction safety)
- Local API bypasses access control by default — use `overrideAccess: false` when needed

## Service Layer

- Business logic in `src/services/` using dependency injection
- Constructor receives store, related stores, and async getters
- See `src/services/discussions.ts` for canonical DI pattern

## Security

- All user input sanitized via `src/security/sanitizers.ts` (`sanitizeHtml`, `sanitizeSql`, `sanitizeUrl`)
- No hardcoded secrets — all via `process.env`
- Access control functions in `src/access/`

## TypeScript

- Strict mode enabled; no `any` without justification
- ESM-only (`"type": "module"`)
- Path alias `@/*` maps to `src/*`; `@payload-config` maps to `src/payload.config.ts`
- Run `generate:types` after every schema change

## After Schema Changes Checklist

1. `pnpm generate:types`
2. `pnpm generate:importmap`
3. `tsc --noEmit`
4. Run migrations if needed

## Code Style

- Immutable patterns (spread operator, no mutation)
- Functions < 50 lines; files < 800 lines
- No `console.log` in production code
