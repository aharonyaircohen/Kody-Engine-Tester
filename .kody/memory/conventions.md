# Conventions

**TypeScript-First:** Strict mode enabled. Use Payload types from `payload` and generated `payload-types.ts`. Run `pnpm generate:types` after collection schema changes.

**Payload Patterns:**

- Always pass `req` to nested operations in hooks (transaction safety)
- Include `saveToJWT: true` on roles field for fast access checks
- Run `generate:importmap` after creating custom components
- Ensure roles exist in Users collection before adding access controls to other collections

**Access Control:** Implement in `src/access/` functions. Local API bypasses access control by default — be explicit.

**Project Structure:** Organize by feature: `collections/`, `services/`, `components/`, `hooks/`, `middleware/`, `api/`, `security/`, `validation/`, `contexts/`. Path aliases: `@/*` → `src/*`, `@payload-config` → `src/payload.config.ts`.

**Reference:** See `AGENTS.md` for Payload development rules, field patterns, and security-critical practices.
