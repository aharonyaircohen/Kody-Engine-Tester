import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

/**
 * Migration: Align user roles with RbacRole enum
 *
 * This migration documents the alignment between the legacy UserStore roles
 * (admin, user, guest, student, instructor) and the new RbacRole enum
 * (admin, editor, viewer).
 *
 * The Payload Users collection already uses ['admin', 'editor', 'viewer'] as
 * defined in src/collections/Users.ts, which is aligned with RbacRole.
 *
 * This migration is informational - no schema changes are required since
 * the Payload collection already uses the correct role values.
 */
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  // No schema changes needed - Users collection already uses correct RbacRole values
  // This migration serves as documentation that UserStore roles have been
  // realigned to match RbacRole: 'admin' | 'editor' | 'viewer'
}

export async function down({}: MigrateDownArgs): Promise<void> {
  // No schema changes to reverse
}