import type { AccessContext } from './index'
import type { UserRole } from '../auth/user-store'

export interface EnrollmentsAccess {
  canCreate: (ctx: AccessContext, enrollment: { studentId?: string }) => boolean
  canRead: (ctx: AccessContext, enrollment: { studentId?: string }) => boolean
  canUpdate: (ctx: AccessContext, enrollment: { studentId?: string }) => boolean
  canDelete: (ctx: AccessContext, enrollment: { studentId?: string }) => boolean
  canListForCourse: (ctx: AccessContext, courseInstructorId?: string) => boolean
  canListForStudent: (ctx: AccessContext, studentId?: string) => boolean
  canMarkComplete: (ctx: AccessContext, enrollment: { studentId?: string }) => boolean
  canDrop: (ctx: AccessContext, enrollment: { studentId?: string }) => boolean
}

// Helper to check if user has at least viewer role
function isViewerOrAbove(role?: UserRole): boolean {
  return role === 'admin' || role === 'editor' || role === 'viewer'
}

export const enrollmentsAccess: EnrollmentsAccess = {
  canCreate(ctx, enrollment) {
    // Viewers, editors, and admins can enroll themselves
    if (isViewerOrAbove(ctx.user?.role)) {
      // Users can only create enrollments for themselves
      if (enrollment.studentId !== ctx.user?.id) {
        return false
      }
      return true
    }
    return false
  },

  canRead(ctx, enrollment) {
    // Viewers can read their own enrollments
    if (enrollment.studentId === ctx.user?.id) return true

    // Admins can read any enrollment
    if (ctx.user?.role === 'admin') return true

    // Editors can read enrollments for their courses
    if (ctx.user?.role === 'editor') return true

    return false
  },

  canUpdate(ctx, enrollment) {
    // Viewers can update their own enrollment status (e.g., drop)
    if (isViewerOrAbove(ctx.user?.role) && enrollment.studentId === ctx.user?.id) {
      return true
    }

    // Admins can update any enrollment
    if (ctx.user?.role === 'admin') return true

    // Editors can update enrollments for their courses
    if (ctx.user?.role === 'editor') return true

    return false
  },

  canDelete(ctx, enrollment) {
    // Users cannot delete their enrollments (they should drop instead)
    if (enrollment.studentId === ctx.user?.id) return false

    // Only admins can delete enrollments
    return ctx.user?.role === 'admin'
  },

  canListForCourse(ctx, courseInstructorId) {
    // Admins can list all enrollments
    if (ctx.user?.role === 'admin') return true

    // Editors can list enrollments for their courses
    if (ctx.user?.role === 'editor') {
      if (courseInstructorId && ctx.user.id === courseInstructorId) return true
    }

    return false
  },

  canListForStudent(ctx, studentId) {
    // Viewers can list their own enrollments
    if (isViewerOrAbove(ctx.user?.role) && studentId === ctx.user?.id) return true

    // Admins can list any student's enrollments
    if (ctx.user?.role === 'admin') return true

    return false
  },

  canMarkComplete(ctx, enrollment) {
    // Admins can mark any enrollment complete
    if (ctx.user?.role === 'admin') return true

    // Editors can mark enrollments complete for their courses
    if (ctx.user?.role === 'editor') return true

    return false
  },

  canDrop(ctx, enrollment) {
    // Viewers can drop their own enrollment
    if (isViewerOrAbove(ctx.user?.role) && enrollment.studentId === ctx.user?.id) {
      return true
    }

    // Admins can drop any enrollment
    if (ctx.user?.role === 'admin') return true

    return false
  },
}

// Field-level access for enrollment documents
export function canReadEnrollmentField(ctx: AccessContext, fieldName: string, ownerId?: string): boolean {
  // Admins can read all fields
  if (ctx.user?.role === 'admin') return true

  // Users can read fields of their own enrollments
  if (ownerId && ctx.user?.id === ownerId) return true

  // Editors can read enrollment fields for course management
  if (ctx.user?.role === 'editor') {
    const editorFields = ['student', 'course', 'enrolledAt', 'status', 'completedAt', 'completedLessons']
    return editorFields.includes(fieldName)
  }

  return false
}

export function canWriteEnrollmentField(ctx: AccessContext, fieldName: string, ownerId?: string): boolean {
  // Admins can write all fields
  if (ctx.user?.role === 'admin') return true

  // Viewers can update their own enrollment status
  if (isViewerOrAbove(ctx.user?.role) && ownerId === ctx.user?.id) {
    if (fieldName === 'status') return true
  }

  // Editors can update enrollment fields for their courses
  if (ctx.user?.role === 'editor') {
    const editorFields = ['status', 'completedAt', 'completedLessons']
    return editorFields.includes(fieldName)
  }

  return false
}

// Check enrollment limits
export function canAddEnrollment(course: { maxEnrollments?: number }, currentCount: number): boolean {
  if (!course.maxEnrollments) return true
  return currentCount < course.maxEnrollments
}

// Check if viewer is already enrolled
export function isAlreadyEnrolled(enrollments: Array<{ studentId?: string }>, studentId: string): boolean {
  return enrollments.some((e) => e.studentId === studentId)
}
