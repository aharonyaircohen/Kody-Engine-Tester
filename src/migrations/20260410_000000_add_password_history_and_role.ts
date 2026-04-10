import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN "passwordHistory" jsonb DEFAULT '[]'::jsonb;
    UPDATE "users" SET "passwordHistory" = '[]'::jsonb WHERE "passwordHistory" IS NULL;
    ALTER TABLE "users" ALTER COLUMN "passwordHistory" SET DEFAULT '[]'::jsonb;
    UPDATE "users" SET "role" = 'viewer' WHERE "role" IS NULL;
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" DROP COLUMN IF EXISTS "passwordHistory";
  `)
}
