import type { AccessContext } from './index'

export interface CoursesAccess {
  canCreate: (ctx: AccessContext) => boolean
  canRead: (ctx: AccessContext, course: { id?: string; instructor?: { id?: string }; status?: string }) => boolean
  canUpdate: (ctx: AccessContext, course: { id?: string; instructor?: { id?: string } }) => boolean
  canDelete: (ctx: AccessContext, course: { id?: string; instructor?: { id?: string } }) => boolean
  canPublish: (ctx: AccessContext, course: { instructor?: { id?: string } }) => boolean
  canArchive: (ctx: AccessContext, course: { instructor?: { id?: string } }) => boolean
}

export const coursesAccess: CoursesAccess = {
  canCreate(ctx) {
    // Only instructors and admins can create courses
    return ctx.user?.role === 'instructor' || ctx.user?.role === 'admin'
  },

  canRead(ctx, course) {
    // Published courses are public
    if (course.status === 'published') return true

    // Admins can read all courses
    if (ctx.user?.role === 'admin') return true

    // Instructors can read their own courses
    if (ctx.user?.role === 'instructor') {
      const instructorId = course.instructor?.id
      if (instructorId && ctx.user.id === instructorId) return true
    }

    // Students can read courses they're enrolled in
    // Note: Enrollment check would need to be done at service level

    return false
  },

  canUpdate(ctx, course) {
    // Admins can update any course
    if (ctx.user?.role === 'admin') return true

    // Instructors can update their own courses
    if (ctx.user?.role === 'instructor') {
      const instructorId = course.instructor?.id
      if (instructorId && ctx.user.id === instructorId) return true
    }

    return false
  },

  canDelete(ctx, course) {
    // Only admins can delete courses
    if (ctx.user?.role === 'admin') return true

    // Instructors cannot delete courses (only archive)
    return false
  },

  canPublish(ctx, course) {
    // Admins can publish any course
    if (ctx.user?.role === 'admin') return true

    // Instructors can publish their own courses
    if (ctx.user?.role === 'instructor') {
      const instructorId = course.instructor?.id
      if (instructorId && ctx.user.id === instructorId) return true
    }

    return false
  },

  canArchive(ctx, course) {
    // Admins can archive any course
    if (ctx.user?.role === 'admin') return true

    // Instructors can archive their own courses
    if (ctx.user?.role === 'instructor') {
      const instructorId = course.instructor?.id
      if (instructorId && ctx.user.id === instructorId) return true
    }

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

  // Instructors can write certain fields for their own courses
  if (ctx.user?.role === 'instructor' && ownerId && ctx.user.id === ownerId) {
    const instructorFields = [
      'title', 'description', 'thumbnail', 'status', 'difficulty',
      'estimatedHours', 'tags', 'maxEnrollments',
    ]
    return instructorFields.includes(fieldName)
  }

  return false
}

// Check if user can enroll in a course
export function canEnrollInCourse(ctx: AccessContext, course: { status?: string; maxEnrollments?: number }, currentEnrollmentCount?: number): boolean {
  // Must be authenticated
  if (!ctx.user) return false

  // Students and admins can enroll
  if (ctx.user.role !== 'student' && ctx.user.role !== 'admin') return false

  // Course must be published
  if (course.status !== 'published') return false

  // Check max enrollments
  if (course.maxEnrollments && currentEnrollmentCount !== undefined) {
    if (currentEnrollmentCount >= course.maxEnrollments) return false
  }

  return true
}
