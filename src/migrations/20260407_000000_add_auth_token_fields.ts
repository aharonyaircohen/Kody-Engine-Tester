import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN "isActive" boolean NOT NULL DEFAULT true;
    ALTER TABLE "users" ADD COLUMN "refreshToken" text;
    ALTER TABLE "users" ADD COLUMN "tokenExpiresAt" timestamp(3) with time zone;
    ALTER TABLE "users" ADD COLUMN "lastTokenUsedAt" timestamp(3) with time zone;
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" DROP COLUMN IF EXISTS "isActive";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "refreshToken";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "tokenExpiresAt";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "lastTokenUsedAt";
  `)
}