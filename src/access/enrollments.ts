import type { AccessContext } from './index'

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

export const enrollmentsAccess: EnrollmentsAccess = {
  canCreate(ctx, enrollment) {
    // Students can enroll themselves
    if (ctx.user?.role === 'student' || ctx.user?.role === 'admin') {
      // Students can only create enrollments for themselves
      if (ctx.user.role === 'student' && enrollment.studentId !== ctx.user.id) {
        return false
      }
      return true
    }
    return false
  },

  canRead(ctx, enrollment) {
    // Students can read their own enrollments
    if (enrollment.studentId === ctx.user?.id) return true

    // Admins can read any enrollment
    if (ctx.user?.role === 'admin') return true

    // Instructors can read enrollments for their courses
    // Note: Course instructor check would need to be done at service level
    if (ctx.user?.role === 'instructor') return true

    return false
  },

  canUpdate(ctx, enrollment) {
    // Students can update their own enrollment status (e.g., drop)
    if (ctx.user?.role === 'student' && enrollment.studentId === ctx.user.id) {
      return true
    }

    // Admins can update any enrollment
    if (ctx.user?.role === 'admin') return true

    // Instructors can update enrollments for their courses
    if (ctx.user?.role === 'instructor') return true

    return false
  },

  canDelete(ctx, enrollment) {
    // Students cannot delete their enrollments (they should drop instead)
    if (enrollment.studentId === ctx.user?.id) return false

    // Only admins can delete enrollments
    return ctx.user?.role === 'admin'
  },

  canListForCourse(ctx, courseInstructorId) {
    // Admins can list all enrollments
    if (ctx.user?.role === 'admin') return true

    // Instructors can list enrollments for their courses
    if (ctx.user?.role === 'instructor') {
      if (courseInstructorId && ctx.user.id === courseInstructorId) return true
    }

    // Students can only list enrollments when a specific course is specified
    // (actual enrollment check should be done at service level)
    if (ctx.user?.role === 'student' && courseInstructorId) return true

    return false
  },

  canListForStudent(ctx, studentId) {
    // Students can list their own enrollments
    if (ctx.user?.role === 'student' && studentId === ctx.user.id) return true

    // Admins can list any student's enrollments
    if (ctx.user?.role === 'admin') return true

    return false
  },

  canMarkComplete(ctx, enrollment) {
    // Students can mark their own enrollment as complete
    if (ctx.user?.role === 'student' && enrollment.studentId === ctx.user.id) {
      return true
    }

    // Admins can mark any enrollment complete
    if (ctx.user?.role === 'admin') return true

    return false
  },

  canDrop(ctx, enrollment) {
    // Students can drop their own enrollment
    if (ctx.user?.role === 'student' && enrollment.studentId === ctx.user.id) {
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

  // Instructors can read enrollment fields for course management
  if (ctx.user?.role === 'instructor') {
    const instructorFields = ['student', 'course', 'enrolledAt', 'status', 'completedAt', 'completedLessons']
    return instructorFields.includes(fieldName)
  }

  return false
}

export function canWriteEnrollmentField(ctx: AccessContext, fieldName: string, ownerId?: string): boolean {
  // Admins can write all fields
  if (ctx.user?.role === 'admin') return true

  // Students can update their own enrollment status
  if (ctx.user?.role === 'student' && ownerId === ctx.user.id) {
    if (fieldName === 'status') return true
  }

  // Instructors can update enrollment fields for their courses
  if (ctx.user?.role === 'instructor') {
    const instructorFields = ['status', 'completedAt', 'completedLessons']
    return instructorFields.includes(fieldName)
  }

  return false
}

// Check enrollment limits
export function canAddEnrollment(course: { maxEnrollments?: number }, currentCount: number): boolean {
  if (!course.maxEnrollments) return true
  return currentCount < course.maxEnrollments
}

// Check if student is already enrolled
export function isAlreadyEnrolled(enrollments: Array<{ studentId?: string }>, studentId: string): boolean {
  return enrollments.some((e) => e.studentId === studentId)
}
