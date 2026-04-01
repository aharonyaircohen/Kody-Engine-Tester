import type { AccessContext } from './index'
import type { UserRole } from '../auth/user-store'

export interface CoursesAccess {
  canCreate: (ctx: AccessContext) => boolean
  canRead: (ctx: AccessContext, course: { id?: string; instructor?: { id?: string }; status?: string }) => boolean
  canUpdate: (ctx: AccessContext, course: { id?: string; instructor?: { id?: string } }) => boolean
  canDelete: (ctx: AccessContext, course: { id?: string; instructor?: { id?: string } }) => boolean
  canPublish: (ctx: AccessContext, course: { instructor?: { id?: string } }) => boolean
  canArchive: (ctx: AccessContext, course: { instructor?: { id?: string } }) => boolean
}

// Helper to check if user has at least editor role
function isEditorOrAbove(role?: UserRole): boolean {
  return role === 'admin' || role === 'editor'
}

export const coursesAccess: CoursesAccess = {
  canCreate(ctx) {
    // Editors and admins can create courses
    return isEditorOrAbove(ctx.user?.role)
  },

  canRead(ctx, course) {
    // Published courses are public
    if (course.status === 'published') return true

    // Admins can read all courses
    if (ctx.user?.role === 'admin') return true

    // Editors can read courses they own
    if (ctx.user?.role === 'editor') {
      const instructorId = course.instructor?.id
      if (instructorId && ctx.user.id === instructorId) return true
    }

    return false
  },

  canUpdate(ctx, course) {
    // Admins can update any course
    if (ctx.user?.role === 'admin') return true

    // Editors can update their own courses
    if (ctx.user?.role === 'editor') {
      const instructorId = course.instructor?.id
      if (instructorId && ctx.user.id === instructorId) return true
    }

    return false
  },

  canDelete(ctx, course) {
    // Only admins can delete courses
    if (ctx.user?.role === 'admin') return true

    return false
  },

  canPublish(ctx, course) {
    // Only admins can publish courses
    if (ctx.user?.role === 'admin') return true

    return false
  },

  canArchive(ctx, course) {
    // Only admins can archive courses
    if (ctx.user?.role === 'admin') return true

    return false
  },
}

// Field-level access for course documents
export function canReadCourseField(ctx: AccessContext, fieldName: string): boolean {
  // Admins can read all fields
  if (ctx.user?.role === 'admin') return true

  // All authenticated users can read basic course fields
  if (ctx.user) {
    const publicFields = [
      'id', 'title', 'slug', 'description', 'thumbnail', 'status',
      'difficulty', 'estimatedHours', 'tags', 'maxEnrollments',
      'instructor', 'createdAt', 'updatedAt',
    ]
    if (publicFields.includes(fieldName)) return true
  }

  return false
}

export function canWriteCourseField(ctx: AccessContext, fieldName: string, ownerId?: string): boolean {
  // Admins can write all fields
  if (ctx.user?.role === 'admin') return true

  // Editors can write certain fields for their own courses
  if (ctx.user?.role === 'editor' && ownerId && ctx.user.id === ownerId) {
    const editorFields = [
      'title', 'description', 'thumbnail', 'status', 'difficulty',
      'estimatedHours', 'tags', 'maxEnrollments',
    ]
    return editorFields.includes(fieldName)
  }

  return false
}

// Check if user can enroll in a course
export function canEnrollInCourse(ctx: AccessContext, course: { status?: string; maxEnrollments?: number }, currentEnrollmentCount?: number): boolean {
  // Must be authenticated
  if (!ctx.user) return false

  // Viewers, editors, and admins can enroll (all except guests/anonymous)
  if (ctx.user.role === 'viewer' || ctx.user.role === 'editor' || ctx.user.role === 'admin') {
    // Course must be published
    if (course.status !== 'published') return false

    // Check max enrollments
    if (course.maxEnrollments && currentEnrollmentCount !== undefined) {
      if (currentEnrollmentCount >= course.maxEnrollments) return false
    }

    return true
  }

  return false
}
