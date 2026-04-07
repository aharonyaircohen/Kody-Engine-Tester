// ─── Types ────────────────────────────────────────────────────────────────────

export interface RubricCriterion {
  criterion: string
  maxPoints: number
  description?: string
}

export interface RubricScore {
  criterion: string
  score: number
  comment?: string
}

export interface GradingResult<T> {
  success: boolean
  submission?: T & {
    grade: number
    status: string
    feedback?: string
    rubricScores: RubricScore[]
    submittedAt: Date
    assignmentId: string
  }
  error?: string
  isLate?: boolean
}

export interface GradingServiceDeps<A, S, C> {
  getAssignment: (id: string) => Promise<A | null>
  getSubmission: (id: string) => Promise<S | null>
  updateSubmission: (
    id: string,
    data: Partial<S & { grade: number; status: string; feedback?: string; rubricScores: RubricScore[] }>,
  ) => Promise<S | null>
  getCourseForAssignment: (assignmentId: string) => Promise<C | null>
}

export interface Grader {
  id: string
  role: 'admin' | 'editor' | 'viewer'
}

export interface GradeSubmissionOptions {
  submissionId: string
  rubricScores: RubricScore[]
  grader: Grader
  feedback?: string
}

// ─── GradingService ────────────────────────────────────────────────────────────

export class GradingService<
  A extends { id: string; maxScore: number; dueDate?: Date; rubric: RubricCriterion[] },
  S extends { id: string; assignmentId: string; studentId: string; submittedAt: Date },
  C extends { id: string; instructorIds: string[] },
> {
  constructor(private deps: GradingServiceDeps<A, S, C>) {}

  /**
   * Check whether a grader may grade a given submission.
   * Admins can grade any submission. Editors may only grade submissions
   * belonging to a course they are assigned to.
   */
  async canGrade(grader: Grader, submissionId: string): Promise<boolean> {
    if (grader.role === 'admin') return true
    if (grader.role === 'viewer') return false

    const submission = await this.deps.getSubmission(submissionId)
    if (!submission) return false

    const course = await this.deps.getCourseForAssignment(submission.assignmentId)
    if (!course) return false

    return course.instructorIds.includes(grader.id)
  }

  /**
   * Grade a submission against the assignment rubric.
   *
   * Validates:
   * - Grader has permission (editor or admin)
   * - Submission exists and belongs to the assignment
   * - Assignment exists
   * - Course exists and grader is authorized for it
   * - Submission has not already been graded
   * - All scores are within [0, criterion.maxPoints]
   * - Total does not exceed assignment.maxScore
   * - No duplicate criterion names
   * - All rubric criteria are scored
   */
  async gradeSubmission(options: GradeSubmissionOptions): Promise<GradingResult<S>> {
    const { submissionId, rubricScores, grader, feedback } = options

    // Permission check
    const submission = await this.deps.getSubmission(submissionId)
    if (!submission) {
      return { success: false, error: `Submission "${submissionId}" not found.` }
    }

    if (grader.role === 'viewer') {
      return { success: false, error: 'Viewers are not authorized to grade submissions.' }
    }

    const assignment = await this.deps.getAssignment(submission.assignmentId)
    if (!assignment) {
      return { success: false, error: `Assignment for submission "${submissionId}" not found.` }
    }

    const course = await this.deps.getCourseForAssignment(submission.assignmentId)
    if (!course) {
      return { success: false, error: 'Course not found — not authorized to grade this submission.' }
    }

    const isEditor = grader.role === 'editor'
    if (isEditor && !course.instructorIds.includes(grader.id)) {
      return { success: false, error: 'You are not authorized to grade submissions for this course.' }
    }

    // Prevent re-grading
    const current = await this.deps.getSubmission(submissionId)
    if (current && (current as unknown as { status?: string }).status === 'graded') {
      return { success: false, error: 'This submission has already been graded.' }
    }

    // Build rubric lookup
    const rubricMap = new Map<string, RubricCriterion>()
    for (const item of assignment.rubric) {
      rubricMap.set(item.criterion, item)
    }

    // Validate: all criteria scored
    const scoredCriteria = new Set<string>()
    for (const rs of rubricScores) {
      if (scoredCriteria.has(rs.criterion)) {
        return {
          success: false,
          error: `Duplicate criterion "${rs.criterion}" in rubricScores. Each criterion may appear only once.`,
        }
      }
      scoredCriteria.add(rs.criterion)
    }

    // Validate unknown criterion names before checking for missing criteria
    for (const rs of rubricScores) {
      if (!rubricMap.has(rs.criterion)) {
        return {
          success: false,
          error: `Criterion "${rs.criterion}" not found in assignment rubric.`,
        }
      }
    }

    const missingCriteria = [...rubricMap.keys()].filter((c) => !scoredCriteria.has(c))
    if (missingCriteria.length > 0) {
      return {
        success: false,
        error: `Missing scores for rubric criteria: ${missingCriteria.join(', ')}.`,
      }
    }

    // Validate: scores within bounds and total within maxScore
    let totalScore = 0
    for (const rs of rubricScores) {
      if (rs.score < 0) {
        return {
          success: false,
          error: `Score for "${rs.criterion}" cannot be negative (got ${rs.score}).`,
        }
      }

      const criterion = rubricMap.get(rs.criterion)!
      if (rs.score > criterion.maxPoints) {
        return {
          success: false,
          error: `Score for "${rs.criterion}" (${rs.score}) exceeds maxPoints (${criterion.maxPoints}).`,
        }
      }

      totalScore += rs.score
    }

    if (totalScore > assignment.maxScore) {
      return {
        success: false,
        error: `Total score (${totalScore}) exceeds assignment maxScore (${assignment.maxScore}).`,
      }
    }

    // Determine lateness
    const isLate = !!assignment.dueDate && submission.submittedAt > assignment.dueDate

    // Persist grade
    const updated = await this.deps.updateSubmission(submissionId, {
      grade: totalScore,
      status: 'graded',
      feedback,
      rubricScores,
    } as Partial<S & { grade: number; status: string; feedback?: string; rubricScores: RubricScore[] }>)

    if (!updated) {
      return { success: false, error: 'Failed to update submission.' }
    }

    return {
      success: true,
      submission: updated as S & { grade: number; status: string; feedback?: string; rubricScores: RubricScore[]; submittedAt: Date; assignmentId: string },
      isLate,
    }
  }
}
