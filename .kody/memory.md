# tRPC/Prisma Conventions

## Data Access Layer

**tRPC Routers:** All API routes live in `src/server/routers/`. Each router is a tRPC router object with procedures for queries and mutations. Use `publicProcedure` for public endpoints and `protectedProcedure` (verify auth via `ctx.session`) for authenticated ones.

**Prisma Client:** Use `prisma` from `src/server/db.ts`. Never instantiate your own client. Prisma schema is in `prisma/schema.prisma`. Use `prisma.$connect()` on startup and `prisma.$disconnect()` on shutdown.

## Database Patterns

**Queries:** Always use Prisma client methods (`findMany`, `findUnique`, `create`, `update`, `delete`). Avoid raw SQL unless absolutely necessary.

**Relations:** Use Prisma's include clause for eager loading relations. For nested writes, use `prisma.$transaction`.

**Migrations:** Run `prisma migrate dev` for development. Production migrations use `prisma migrate deploy`.

## Validation

**Input Validation:** Use Zod schemas for all tRPC procedure inputs. Define schemas in `src/server/schema/`.

**Error Handling:** Throw `TRPCError` with appropriate error codes. Never expose internal errors to clients.

## File Structure

```
src/server/
├── db.ts           # Prisma client singleton
├── routers/        # tRPC routers
│   ├── _app.ts     # Root router
│   └── *.ts        # Feature routers
├── schema/         # Zod validation schemas
├── context.ts      # tRPC context (session, etc.)
└── trpc.ts         # tRPC initialization
```