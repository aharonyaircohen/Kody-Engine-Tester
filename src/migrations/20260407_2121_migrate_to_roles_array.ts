import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Migration: Add roles array column and migrate existing role values
 *
 * This migration:
 * 1. Adds the "roles" text[] column to the users table (handled via Payload collection update)
 * 2. Migrates existing users: sets roles = [role] where roles is not already set
 *
 * The roles field was added to src/collections/Users.ts as a select with hasMany: true
 * This migration populates it for existing users based on their existing role field.
 */
export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  // Migrate existing users: set roles = [role] where roles is NULL or empty
  // This uses a raw SQL UPDATE to populate the roles array from the role column
  await db.execute(sql`
    UPDATE "users"
    SET "roles" = ARRAY["role"]
    WHERE "roles" IS NULL OR array_length("roles", 1) IS NULL
  `)
}

export async function down({ db, payload: _payload }: MigrateDownArgs): Promise<void> {
  // Rollback: clear the roles column values
  // The column itself is kept for backwards compatibility
  await db.execute(sql`
    UPDATE "users" SET "roles" = NULL
  `)
}