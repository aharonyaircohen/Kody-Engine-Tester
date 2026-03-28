# Conventions

- **Auth**: Use JWT with role guards; protect API routes in `src/api`
- **Collections**: Payload CMS collections in `src/collections/*.ts`
- **Components**: React components in `src/components`
- **API Routes**: Next.js app routes under `src/app/api`
- **Middleware**: Auth and rate limiting in `src/middleware`
- **Validation**: Input validation in `src/validation`
- **TypeScript**: Strict mode enabled; path aliases (`@/*` → `src/*`, `@payload-config` → `src/payload.config.ts`)
- **Testing**: Vitest for unit/integration, Playwright for e2e
- **Linting**: ESLint with Next.js config