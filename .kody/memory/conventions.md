# Conventions

- **TypeScript**: Strict mode enabled, all files typed
- **Auth**: Role-based access control; middleware guards for `student`, `instructor`, `admin`
- **API Design**: REST routes in `src/api`, Payload collections in `src/collections`
- **State**: React Context in `src/contexts`, custom hooks in `src/hooks`
- **Components**: Server Components preferred (Next.js App Router pattern)
- **Database**: Payload collections-based schema; migrations in `src/migrations`
- **Testing**: Vitest (`pnpm test:int`), Playwright e2e (`pnpm test:e2e`)
- **Code Quality**: ESLint for linting, TypeScript in build, Prettier for formatting
- **Tooling**: `pnpm` package manager; `payload generate:types` for CMS type generation