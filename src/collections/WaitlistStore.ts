// In-memory FIFO waitlist store per course.

export interface WaitlistEntry {
  userId: string
  courseId: string
  joinedAt: Date
  /** 1-indexed; recomputed on every read via getQueueForCourse */
  position: number
}

export class WaitlistStore {
  // outer key: courseId, inner key: userId
  private byCourse: Map<string, Map<string, WaitlistEntry>> = new Map()

  /**
   * Add a user to the waitlist for a course.
   * Idempotent: if the user is already on the waitlist, returns the existing entry.
   */
  add(userId: string, courseId: string): WaitlistEntry {
    if (!this.byCourse.has(courseId)) {
      this.byCourse.set(courseId, new Map())
    }
    const courseMap = this.byCourse.get(courseId)!
    if (courseMap.has(userId)) {
      return courseMap.get(userId)!
    }
    const entry: WaitlistEntry = {
      userId,
      courseId,
      joinedAt: new Date(),
      position: 1, // placeholder; recomputed below
    }
    courseMap.set(userId, entry)
    // Recompute position so the returned entry reflects current queue order
    const queue = this.getQueueForCourse(courseId)
    return queue.find((e) => e.userId === userId) ?? entry
  }

  /**
   * Remove a user from the waitlist for a course.
   * @returns `true` if the user was present and removed; `false` if not present.
   */
  remove(userId: string, courseId: string): boolean {
    const courseMap = this.byCourse.get(courseId)
    if (!courseMap) return false
    return courseMap.delete(userId)
  }

  /**
   * FIFO pop: removes and returns the earliest entry (lowest `joinedAt`).
   * Ties on `joinedAt` are broken by `userId` lexicographic order.
   * @returns `null` if the waitlist for this course is empty.
   */
  popHead(courseId: string): WaitlistEntry | null {
    const courseMap = this.byCourse.get(courseId)
    if (!courseMap || courseMap.size === 0) return null

    const sorted = Array.from(courseMap.values()).sort((a, b) => {
      const timeDiff = a.joinedAt.getTime() - b.joinedAt.getTime()
      if (timeDiff !== 0) return timeDiff
      return a.userId.localeCompare(b.userId)
    })

    const head = sorted[0]
    courseMap.delete(head.userId)
    return head
  }

  /**
   * Returns the waitlist entry for a specific user in a specific course,
   * or `null` if the user is not on the waitlist for that course.
   */
  getEntry(userId: string, courseId: string): WaitlistEntry | null {
    return this.byCourse.get(courseId)?.get(userId) ?? null
  }

  /**
   * Returns the waitlist for a course, sorted FIFO (by `joinedAt` asc, `userId` asc as tiebreak).
   * Positions are recomputed and filled 1…N.
   * Returns empty array if the course has no waitlist.
   */
  getQueueForCourse(courseId: string): WaitlistEntry[] {
    const courseMap = this.byCourse.get(courseId)
    if (!courseMap) return []

    return Array.from(courseMap.values())
      .sort((a, b) => {
        const timeDiff = a.joinedAt.getTime() - b.joinedAt.getTime()
        if (timeDiff !== 0) return timeDiff
        return a.userId.localeCompare(b.userId)
      })
      .map((entry, index) => ({ ...entry, position: index + 1 }))
  }

  /**
   * Returns all waitlist entries for a user across all courses.
   * Positions are recomputed per course (1…N).
   */
  getQueuesForUser(userId: string): WaitlistEntry[] {
    const results: WaitlistEntry[] = []
    for (const [courseId, courseMap] of this.byCourse.entries()) {
      const entry = courseMap.get(userId)
      if (entry) {
        const queue = this.getQueueForCourse(courseId)
        const updated = queue.find((e) => e.userId === userId)
        if (updated) results.push(updated)
      }
    }
    return results
  }
}

export const waitlistStore = new WaitlistStore()
