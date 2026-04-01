import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Migration: Add OAuth provider linking fields to users table
 *
 * This migration adds the following columns to support multi-provider OAuth:
 * - provider: Primary OAuth provider (google, github)
 * - provider_id: Provider-specific user ID
 * - linked_accounts: JSON array of additional linked providers
 *
 * Note: This migration is for documentation purposes as the in-memory UserStore
 * in src/auth/user-store.ts handles OAuth fields natively.
 */
export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "provider" varchar;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "provider_id" varchar;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "linked_accounts" jsonb DEFAULT '[]'::jsonb;

    CREATE INDEX IF NOT EXISTS "users_provider_idx" ON "users" USING btree ("provider");
    CREATE INDEX IF NOT EXISTS "users_provider_id_idx" ON "users" USING btree ("provider_id");
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" DROP COLUMN IF EXISTS "provider";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "provider_id";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "linked_accounts";

    DROP INDEX IF EXISTS "users_provider_idx";
    DROP INDEX IF EXISTS "users_provider_id_idx";
  `)
}