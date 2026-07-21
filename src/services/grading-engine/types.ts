/**
 * Shared types for the unified grading subsystem.
 * These types are used across grade calculation, quiz grading, and assignment grading.
 */

// ─── Grade Entry Types ─────────────────────────────────────────────────────────

export interface StudentGradebookEntry {
  courseId: string
  courseTitle: string
  quizAverage: number
  assignmentAverage: number
  overallGrade: number
  quizWeight: number
  assignmentWeight: number
  progress: number
}

export interface CourseGradebookEntry {
  studentId: string
  quizAverage: number
  assignmentAverage: number
  overallGrade: number
  quizWeight: number
  assignmentWeight: number
}

export interface CourseEnrollmentRef {
  enrollmentId: string
  studentId: string
}

// ─── Quiz Grading Types ────────────────────────────────────────────────────────

export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer'

export interface QuestionOption {
  text: string
  isCorrect: boolean
}

export interface QuizQuestion {
  text: string
  type: QuestionType
  options: QuestionOption[]
  correctAnswer?: string
  points: number
}

export interface Quiz {
  id: string
  title: string
  passingScore: number
  maxAttempts: number
  questions: QuizQuestion[]
}

export interface QuizAnswer {
  questionIndex: number
  answer: string | number
}

export interface GradingResult {
  questionIndex: number
  questionText: string
  correct: boolean
  pointsEarned: number
  correctAnswer?: string
  userAnswer?: string
}

export interface GradeOutput {
  score: number
  passed: boolean
  results: GradingResult[]
  totalPoints: number
  earnedPoints: number
}

export interface AttemptCheck {
  count: number
  exceeded: boolean
}

// ─── Assignment Grading Types ─────────────────────────────────────────────────

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

export interface GradingServiceResult<T> {
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

export interface Grader {
  id: string
  role: 'admin' | 'instructor' | 'student'
}

export interface GradeSubmissionOptions {
  submissionId: string
  rubricScores: RubricScore[]
  grader: Grader
  feedback?: string
}

// ─── Gradebook Service Dependency Types ───────────────────────────────────────

export interface GradebookServiceDeps<
  TCourse,
  TQuiz,
  TQuizAttempt,
  TAssignment,
  TSubmission,
  TEnrollment,
  TLesson,
  TCompletedLesson,
> {
  getCourse: (id: string) => Promise<TCourse | null>
  getQuizzes: (courseId: string) => Promise<TQuiz[]>
  getQuizAttempts: (studentId: string, quizId: string) => Promise<TQuizAttempt[]>
  getAssignments: (courseId: string) => Promise<TAssignment[]>
  getSubmissions: (studentId: string, assignmentId: string) => Promise<TSubmission[]>
  getEnrollments: (studentId: string) => Promise<TEnrollment[]>
  getCourseEnrollments: (courseId: string) => Promise<CourseEnrollmentRef[]>
  getLessons: (courseId: string) => Promise<TLesson[]>
  getCompletedLessons: (enrollmentId: string) => Promise<TCompletedLesson[]>
}

// ─── Grading Service Dependency Types ─────────────────────────────────────────

export interface GradingServiceDeps<A, S, C> {
  getAssignment: (id: string) => Promise<A | null>
  getSubmission: (id: string) => Promise<S | null>
  updateSubmission: (
    id: string,
    data: Partial<S & { grade: number; status: string; feedback?: string; rubricScores: RubricScore[] }>,
  ) => Promise<S | null>
  getCourseForAssignment: (assignmentId: string) => Promise<C | null>
}
