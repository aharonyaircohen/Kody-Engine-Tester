import { describe, it, expect, beforeEach } from 'vitest'
import { GradingService, RubricScore } from './grading'

// ─── Test helpers ──────────────────────────────────────────────────────────────

type Role = 'admin' | 'editor' | 'viewer'

interface MockUser {
  id: string
  role: Role
}

interface MockAssignment {
  id: string
  maxScore: number
  dueDate?: Date
  rubric: Array<{ criterion: string; maxPoints: number; description: string }>
}

interface MockSubmission {
  id: string
  assignmentId: string
  studentId: string
  submittedAt: Date
}

interface MockCourse {
  id: string
  instructorIds: string[]
}

function makeService() {
  const assignments = new Map<string, MockAssignment>()
  const submissions = new Map<string, MockSubmission>()
  const courses = new Map<string, MockCourse>()

  const svc = new GradingService<MockAssignment, MockSubmission, MockCourse>({
    getAssignment: async (id) => assignments.get(id) ?? null,
    getSubmission: async (id) => submissions.get(id) ?? null,
    updateSubmission: async (id, data) => {
      const existing = submissions.get(id)
      if (!existing) return null
      const updated = { ...existing, ...data }
      submissions.set(id, updated as MockSubmission)
      return updated as MockSubmission
    },
    getCourseForAssignment: async (assignmentId) => {
      const assignment = assignments.get(assignmentId)
      if (!assignment) return null
      return courses.get(assignmentId) ?? null
    },
  })

  return { svc, assignments, submissions, courses }
}

function addAssignment(
  assignments: Map<string, MockAssignment>,
  overrides: Partial<MockAssignment> = {},
): MockAssignment {
  const a: MockAssignment = {
    id: `assignment-${assignments.size + 1}`,
    maxScore: 100,
    rubric: [
      { criterion: 'Content Quality', maxPoints: 40, description: 'Depth and accuracy of content' },
      { criterion: 'Organization', maxPoints: 30, description: 'Logical structure and flow' },
      { criterion: 'Grammar & Style', maxPoints: 30, description: 'Clear and correct writing' },
    ],
    ...overrides,
  }
  assignments.set(a.id, a)
  return a
}

function addSubmission(
  submissions: Map<string, MockSubmission>,
  assignmentId: string,
  studentId: string,
  daysAgo = 0,
): MockSubmission {
  const s: MockSubmission = {
    id: `submission-${submissions.size + 1}`,
    assignmentId,
    studentId,
    submittedAt: new Date(Date.now() - daysAgo * 86_400_000),
  }
  submissions.set(s.id, s)
  return s
}

function addCourse(
  courses: Map<string, MockCourse>,
  assignmentId: string,
  instructorIds: string[],
): MockCourse {
  const c: MockCourse = { id: `course-${courses.size + 1}`, instructorIds }
  courses.set(assignmentId, c)
  return c
}

// ─── Rubric validation ────────────────────────────────────────────────────────

describe('Rubric validation', () => {
  it('accepts valid scores within rubric maxPoints', async () => {
    const { svc, assignments, submissions, courses } = makeService()
    const assignment = addAssignment(assignments)
    const submission = addSubmission(submissions, assignment.id, 'student-1')
    addCourse(courses, assignment.id, ['editor-1'])

    const scores: RubricScore[] = [
      { criterion: 'Content Quality', score: 40 },
      { criterion: 'Organization', score: 25 },
      { criterion: 'Grammar & Style', score: 20 },
    ]

    const result = await svc.gradeSubmission({
      submissionId: submission.id,
      rubricScores: scores,
      grader: { id: 'editor-1', role: 'editor' },
    })

    expect(result.success).toBe(true)
    expect(result.submission?.grade).toBe(85)
  })

  it('rejects a score that exceeds criterion maxPoints', async () => {
    const { svc, assignments, submissions, courses } = makeService()
    const assignment = addAssignment(assignments)
    const submission = addSubmission(submissions, assignment.id, 'student-1')
    addCourse(courses, assignment.id, ['editor-1'])

    const scores: RubricScore[] = [
      { criterion: 'Content Quality', score: 50 }, // max is 40
      { criterion: 'Organization', score: 25 },
      { criterion: 'Grammar & Style', score: 20 },
    ]

    const result = await svc.gradeSubmission({
      submissionId: submission.id,
      rubricScores: scores,
      grader: { id: 'editor-1', role: 'editor' },
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('exceeds maxPoints')
    expect(result.error).toContain('Content Quality')
  })

  it('rejects a score below 0', async () => {
    const { svc, assignments, submissions, courses } = makeService()
    const assignment = addAssignment(assignments)
    const submission = addSubmission(submissions, assignment.id, 'student-1')
    addCourse(courses, assignment.id, ['editor-1'])

    const scores: RubricScore[] = [
      { criterion: 'Content Quality', score: -5 },
      { criterion: 'Organization', score: 25 },
      { criterion: 'Grammar & Style', score: 20 },
    ]

    const result = await svc.gradeSubmission({
      submissionId: submission.id,
      rubricScores: scores,
      grader: { id: 'editor-1', role: 'editor' },
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('cannot be negative')
  })

  it('rejects scores that sum above the assignment maxScore cap', async () => {
    const { svc, assignments, submissions, courses } = makeService()
    // Set rubric maxPoints (45+45=90) above maxScore (80) so perfect scores exceed the cap
    const assignment = addAssignment(assignments, { maxScore: 80, rubric: [
      { criterion: 'Content Quality', maxPoints: 45, description: 'Depth and accuracy' },
      { criterion: 'Organization', maxPoints: 45, description: 'Logical structure' },
    ]})
    const submission = addSubmission(submissions, assignment.id, 'student-1')
    addCourse(courses, assignment.id, ['editor-1'])

    const scores: RubricScore[] = [
      { criterion: 'Content Quality', score: 45 },
      { criterion: 'Organization', score: 45 },
    ]

    const result = await svc.gradeSubmission({
      submissionId: submission.id,
      rubricScores: scores,
      grader: { id: 'editor-1', role: 'editor' },
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('exceeds assignment maxScore')
  })

  it('rejects scores for unknown criterion names', async () => {
    const { svc, assignments, submissions, courses } = makeService()
    const assignment = addAssignment(assignments)
    const submission = addSubmission(submissions, assignment.id, 'student-1')
    addCourse(courses, assignment.id, ['editor-1'])

    const scores: RubricScore[] = [
      { criterion: 'Wrong Criterion', score: 10 },
      { criterion: 'Content Quality', score: 30 },
      { criterion: 'Organization', score: 25 },
    ]

    const result = await svc.gradeSubmission({
      submissionId: submission.id,
      rubricScores: scores,
      grader: { id: 'editor-1', role: 'editor' },
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('not found in assignment rubric')
  })

  it('rejects duplicate criterion names in scores', async () => {
    const { svc, assignments, submissions, courses } = makeService()
    const assignment = addAssignment(assignments)
    const submission = addSubmission(submissions, assignment.id, 'student-1')
    addCourse(courses, assignment.id, ['editor-1'])

    const scores: RubricScore[] = [
      { criterion: 'Content Quality', score: 30 },
      { criterion: 'Content Quality', score: 35 },
      { criterion: 'Organization', score: 25 },
    ]

    const result = await svc.gradeSubmission({
      submissionId: submission.id,
      rubricScores: scores,
      grader: { id: 'editor-1', role: 'editor' },
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('Duplicate')
  })
})

// ─── Score calculation ────────────────────────────────────────────────────────

describe('Score calculation', () => {
  it('sums all rubric scores correctly', async () => {
    const { svc, assignments, submissions, courses } = makeService()
    const assignment = addAssignment(assignments)
    const submission = addSubmission(submissions, assignment.id, 'student-1')
    addCourse(courses, assignment.id, ['editor-1'])

    const scores: RubricScore[] = [
      { criterion: 'Content Quality', score: 40 },
      { criterion: 'Organization', score: 30 },
      { criterion: 'Grammar & Style', score: 30 },
    ]

    const result = await svc.gradeSubmission({
      submissionId: submission.id,
      rubricScores: scores,
      grader: { id: 'editor-1', role: 'editor' },
    })

    expect(result.success).toBe(true)
    expect(result.submission?.grade).toBe(100)
  })

  it('accepts partial credit', async () => {
    const { svc, assignments, submissions, courses } = makeService()
    const assignment = addAssignment(assignments)
    const submission = addSubmission(submissions, assignment.id, 'student-1')
    addCourse(courses, assignment.id, ['editor-1'])

    const scores: RubricScore[] = [
      { criterion: 'Content Quality', score: 20 },
      { criterion: 'Organization', score: 15 },
      { criterion: 'Grammar & Style', score: 10 },
    ]

    const result = await svc.gradeSubmission({
      submissionId: submission.id,
      rubricScores: scores,
      grader: { id: 'editor-1', role: 'editor' },
    })

    expect(result.success).toBe(true)
    expect(result.submission?.grade).toBe(45)
  })

  it('stores rubricScores and feedback on the submission', async () => {
    const { svc, assignments, submissions, courses } = makeService()
    const assignment = addAssignment(assignments)
    const submission = addSubmission(submissions, assignment.id, 'student-1')
    addCourse(courses, assignment.id, ['editor-1'])

    const scores: RubricScore[] = [
      { criterion: 'Content Quality', score: 35, comment: 'Good depth' },
      { criterion: 'Organization', score: 28, comment: 'Well structured' },
      { criterion: 'Grammar & Style', score: 25, comment: 'Minor errors' },
    ]

    const feedback = 'Well done overall.'

    const result = await svc.gradeSubmission({
      submissionId: submission.id,
      rubricScores: scores,
      grader: { id: 'editor-1', role: 'editor' },
      feedback,
    })

    expect(result.success).toBe(true)
    expect(result.submission?.rubricScores).toEqual(scores)
    expect(result.submission?.feedback).toBe(feedback)
    expect(result.submission?.status).toBe('graded')
  })

  it('returns the graded submission with all fields', async () => {
    const { svc, assignments, submissions, courses } = makeService()
    const assignment = addAssignment(assignments)
    const submission = addSubmission(submissions, assignment.id, 'student-1')
    addCourse(courses, assignment.id, ['editor-1'])

    const scores: RubricScore[] = [
      { criterion: 'Content Quality', score: 40 },
      { criterion: 'Organization', score: 20 },
      { criterion: 'Grammar & Style', score: 15 },
    ]

    const result = await svc.gradeSubmission({
      submissionId: submission.id,
      rubricScores: scores,
      grader: { id: 'editor-1', role: 'editor' },
    })

    expect(result.success).toBe(true)
    const graded = result.submission!
    expect(graded.id).toBe(submission.id)
    expect(graded.assignmentId).toBe(assignment.id)
    expect(graded.grade).toBe(75)
    expect(graded.status).toBe('graded')
    expect(graded.submittedAt).toBeInstanceOf(Date)
  })
})

// ─── Overdue submission handling ─────────────────────────────────────────────

describe('Overdue submission handling', () => {
  it('allows grading an on-time submission', async () => {
    const { svc, assignments, submissions, courses } = makeService()
    const dueDate = new Date(Date.now() + 86_400_000) // tomorrow
    const assignment = addAssignment(assignments, { dueDate })
    const submission = addSubmission(submissions, assignment.id, 'student-1', 0) // today
    addCourse(courses, assignment.id, ['editor-1'])

    const result = await svc.gradeSubmission({
      submissionId: submission.id,
      rubricScores: [
        { criterion: 'Content Quality', score: 40 },
        { criterion: 'Organization', score: 30 },
        { criterion: 'Grammar & Style', score: 30 },
      ],
      grader: { id: 'editor-1', role: 'editor' },
    })

    expect(result.success).toBe(true)
    expect(result.isLate).toBe(false)
  })

  it('flags grading result as late when submitted after due date', async () => {
    const { svc, assignments, submissions, courses } = makeService()
    // Due date: 3 days ago; submission: 1 day ago → definitely late
    const dueDate = new Date(Date.now() - 3 * 86_400_000)
    const assignment = addAssignment(assignments, { dueDate })
    const submission = addSubmission(submissions, assignment.id, 'student-1', 1) // submitted 1 day ago
    addCourse(courses, assignment.id, ['editor-1'])

    const result = await svc.gradeSubmission({
      submissionId: submission.id,
      rubricScores: [
        { criterion: 'Content Quality', score: 40 },
        { criterion: 'Organization', score: 30 },
        { criterion: 'Grammar & Style', score: 30 },
      ],
      grader: { id: 'editor-1', role: 'editor' },
    })

    expect(result.success).toBe(true)
    expect(result.isLate).toBe(true)
    expect(result.submission?.grade).toBe(100)
  })

  it('grades when assignment has no due date', async () => {
    const { svc, assignments, submissions, courses } = makeService()
    const assignment = addAssignment(assignments, { dueDate: undefined })
    const submission = addSubmission(submissions, assignment.id, 'student-1', 10)
    addCourse(courses, assignment.id, ['editor-1'])

    const result = await svc.gradeSubmission({
      submissionId: submission.id,
      rubricScores: [
        { criterion: 'Content Quality', score: 40 },
        { criterion: 'Organization', score: 30 },
        { criterion: 'Grammar & Style', score: 30 },
      ],
      grader: { id: 'editor-1', role: 'editor' },
    })

    expect(result.success).toBe(true)
    expect(result.isLate).toBe(false)
  })
})

// ─── Permission checks ────────────────────────────────────────────────────────

describe('Permission checks', () => {
  it('allows an editor who owns the course to grade', async () => {
    const { svc, assignments, submissions, courses } = makeService()
    const assignment = addAssignment(assignments)
    const submission = addSubmission(submissions, assignment.id, 'student-1')
    addCourse(courses, assignment.id, ['editor-1', 'editor-2'])

    const allowed = await svc.canGrade({ id: 'editor-1', role: 'editor' }, submission.id)
    expect(allowed).toBe(true)
  })

  it('allows an admin to grade any submission', async () => {
    const { svc, assignments, submissions, courses } = makeService()
    const assignment = addAssignment(assignments)
    const submission = addSubmission(submissions, assignment.id, 'student-1')
    addCourse(courses, assignment.id, ['editor-1'])

    const allowed = await svc.canGrade({ id: 'admin-1', role: 'admin' }, submission.id)
    expect(allowed).toBe(true)
  })

  it('denies a viewer from grading', async () => {
    const { svc, assignments, submissions, courses } = makeService()
    const assignment = addAssignment(assignments)
    const submission = addSubmission(submissions, assignment.id, 'student-1')
    addCourse(courses, assignment.id, ['editor-1'])

    const gradeResult = await svc.gradeSubmission({
      submissionId: submission.id,
      rubricScores: [
        { criterion: 'Content Quality', score: 40 },
        { criterion: 'Organization', score: 30 },
        { criterion: 'Grammar & Style', score: 30 },
      ],
      grader: { id: 'viewer-1', role: 'viewer' },
    })

    expect(gradeResult.success).toBe(false)
    expect(gradeResult.error).toContain('not authorized')
  })

  it('denies an editor from grading when not assigned to the course', async () => {
    const { svc, assignments, submissions, courses } = makeService()
    const assignment = addAssignment(assignments)
    const submission = addSubmission(submissions, assignment.id, 'student-1')
    addCourse(courses, assignment.id, ['editor-1'])

    const gradeResult = await svc.gradeSubmission({
      submissionId: submission.id,
      rubricScores: [
        { criterion: 'Content Quality', score: 40 },
        { criterion: 'Organization', score: 30 },
        { criterion: 'Grammar & Style', score: 30 },
      ],
      grader: { id: 'stranger-editor', role: 'editor' },
    })

    expect(gradeResult.success).toBe(false)
    expect(gradeResult.error).toContain('not authorized')
  })

  it('returns false for canGrade when grader is a viewer', async () => {
    const { svc, assignments, submissions, courses } = makeService()
    const assignment = addAssignment(assignments)
    const submission = addSubmission(submissions, assignment.id, 'student-1')
    addCourse(courses, assignment.id, ['editor-1'])

    const allowed = await svc.canGrade({ id: 'viewer-1', role: 'viewer' }, submission.id)
    expect(allowed).toBe(false)
  })
})

// ─── Error handling ───────────────────────────────────────────────────────────

describe('Error handling', () => {
  it('returns error when submission does not exist', async () => {
    const { svc } = makeService()

    const result = await svc.gradeSubmission({
      submissionId: 'non-existent',
      rubricScores: [{ criterion: 'Content Quality', score: 40 }],
      grader: { id: 'editor-1', role: 'editor' },
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('not found')
  })

  it('returns error when assignment does not exist', async () => {
    const { svc, submissions } = makeService()
    addSubmission(submissions, 'ghost-assignment', 'student-1')

    const result = await svc.gradeSubmission({
      submissionId: 'submission-1',
      rubricScores: [{ criterion: 'Content Quality', score: 40 }],
      grader: { id: 'editor-1', role: 'editor' },
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('not found')
  })

  it('returns error when course does not exist', async () => {
    const { svc, assignments, submissions } = makeService()
    const assignment = addAssignment(assignments)
    addSubmission(submissions, assignment.id, 'student-1')
    // No course added

    const result = await svc.gradeSubmission({
      submissionId: 'submission-1',
      rubricScores: [
        { criterion: 'Content Quality', score: 40 },
        { criterion: 'Organization', score: 30 },
        { criterion: 'Grammar & Style', score: 30 },
      ],
      grader: { id: 'editor-1', role: 'editor' },
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('not authorized')
  })

  it('rejects already-graded submissions', async () => {
    const { svc, assignments, submissions, courses } = makeService()
    const assignment = addAssignment(assignments)
    const submission = addSubmission(submissions, assignment.id, 'student-1')
    addCourse(courses, assignment.id, ['editor-1'])

    // First grading
    await svc.gradeSubmission({
      submissionId: submission.id,
      rubricScores: [
        { criterion: 'Content Quality', score: 40 },
        { criterion: 'Organization', score: 30 },
        { criterion: 'Grammar & Style', score: 30 },
      ],
      grader: { id: 'editor-1', role: 'editor' },
    })

    // Second grading attempt
    const result = await svc.gradeSubmission({
      submissionId: submission.id,
      rubricScores: [
        { criterion: 'Content Quality', score: 20 },
        { criterion: 'Organization', score: 15 },
        { criterion: 'Grammar & Style', score: 10 },
      ],
      grader: { id: 'editor-1', role: 'editor' },
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('already been graded')
  })

  it('returns a zero-grade result correctly', async () => {
    const { svc, assignments, submissions, courses } = makeService()
    const assignment = addAssignment(assignments)
    const submission = addSubmission(submissions, assignment.id, 'student-1')
    addCourse(courses, assignment.id, ['editor-1'])

    const scores: RubricScore[] = [
      { criterion: 'Content Quality', score: 0 },
      { criterion: 'Organization', score: 0 },
      { criterion: 'Grammar & Style', score: 0 },
    ]

    const result = await svc.gradeSubmission({
      submissionId: submission.id,
      rubricScores: scores,
      grader: { id: 'editor-1', role: 'editor' },
    })

    expect(result.success).toBe(true)
    expect(result.submission?.grade).toBe(0)
  })
})
