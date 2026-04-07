import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Migration: Add roles array, rbacRole column, and sessionRevokedAt for JWT/RBAC migration
 *
 * Changes:
 * - Adds `roles` column as text[] array (RBAC roles: admin, editor, viewer)
 * - Adds `rbacRole` column as text (mapped from legacy role)
 * - Adds `sessionRevokedAt` timestamp to invalidate old sessions
 * - Legacy role mapping:
 *   - admin → admin
 *   - instructor → editor
 *   - student/user/guest → viewer
 *   - user → viewer
 */
export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  // Add new columns
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "roles" text[];
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "rbacRole" text;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "sessionRevokedAt" timestamp(3) with time zone;
  `)

  // Migrate existing users: map legacy roles to RBAC roles
  // admin stays admin, instructor becomes editor, all others become viewer
  await db.execute(sql`
    UPDATE "users" SET "rbacRole" = 'admin', "roles" = ARRAY['admin']
      WHERE "role" = 'admin';

    UPDATE "users" SET "rbacRole" = 'editor', "roles" = ARRAY['editor']
      WHERE "role" = 'instructor';

    UPDATE "users" SET "rbacRole" = 'viewer', "roles" = ARRAY['viewer']
      WHERE "role" IN ('student', 'user', 'guest');
  `)

  // Drop permissions column if it exists (old schema)
  await db.execute(sql`
    ALTER TABLE "users" DROP COLUMN IF EXISTS "permissions";
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" DROP COLUMN IF EXISTS "roles";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "rbacRole";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "sessionRevokedAt";
  `)
}