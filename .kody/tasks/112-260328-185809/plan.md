## Step 1: Define analytics types and service interface

**File:** `src/services/analytics.ts`
**Change:** Create the types and `AnalyticsService` class with dependency injection (matching the `GradingService` pattern). Define `CourseAnalytics`, `InstructorOverview`, `ModuleCompletion`, `AtRiskStudent` types and the `AnalyticsServiceDeps` interface. Implement `getCourseAnalytics` and `getInstructorOverview` as pure computation over injected data fetchers.
**Why:** Dependency injection makes the service fully testable without Payload, consistent with the existing `GradingService` pattern.
**Verify:** `npx tsc --noEmit` passes

**Complete code:**
```typescript
// ─── Types ────────────────────────────────────────────────────────────────────

export interface ModuleCompletion {
  moduleId: string
  moduleTitle: string
  completionRate: number
}

export interface AtRiskStudent {
  studentId: string
  studentName: string
  progressPercentage: number
  averageGrade: number | null
  reason: 'low-progress' | 'low-grade' | 'both'
}

export interface CourseAnalytics {
  totalEnrollments: number
  activeStudents: number
  completionRate: number
  averageGrade: number | null
  moduleCompletions: ModuleCompletion[]
  mostDifficultQuiz: { quizId: string; quizTitle: string; averageScore: number } | null
  atRiskStudents: AtRiskStudent[]
}

export interface InstructorOverview {
  totalCourses: number
  totalStudents: number
  averageCompletionRate: number
}

// ─── Dependency contracts ─────────────────────────────────────────────────────

export interface EnrollmentRecord {
  id: string
  studentId: string
  studentName: string
  status: 'active' | 'completed' | 'dropped'
  completedLessonIds: string[]
}

export interface QuizAttemptRecord {
  quizId: string
  quizTitle: string
  userId: string
  score: number
}

export interface SubmissionRecord {
  studentId: string
  grade: number | null
  maxScore: number
}

export interface ModuleRecord {
  id: string
  title: string
  lessonIds: string[]
}

export interface AnalyticsServiceDeps {
  getEnrollmentsByCourse: (courseId: string) => Promise<EnrollmentRecord[]>
  getModulesByCourse: (courseId: string) => Promise<ModuleRecord[]>
  getTotalLessonsByCourse: (courseId: string) => Promise<number>
  getQuizAttemptsByCourse: (courseId: string) => Promise<QuizAttemptRecord[]>
  getSubmissionsByCourse: (courseId: string) => Promise<SubmissionRecord[]>
  getCoursesByInstructor: (instructorId: string) => Promise<{ id: string }[]>
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PROGRESS_THRESHOLD = 50
const PASSING_GRADE = 70
const QUIZ_WEIGHT = 0.4
const ASSIGNMENT_WEIGHT = 0.6

// ─── Service ──────────────────────────────────────────────────────────────────

export class AnalyticsService {
  constructor(private deps: AnalyticsServiceDeps) {}

  async getCourseAnalytics(courseId: string): Promise<CourseAnalytics> {
    const [enrollments, modules, totalLessons, quizAttempts, submissions] = await Promise.all([
      this.deps.getEnrollmentsByCourse(courseId),
      this.deps.getModulesByCourse(courseId),
      this.deps.getTotalLessonsByCourse(courseId),
      this.deps.getQuizAttemptsByCourse(courseId),
      this.deps.getSubmissionsByCourse(courseId),
    ])

    const nonDropped = enrollments.filter((e) => e.status !== 'dropped')
    const totalEnrollments = nonDropped.length
    const activeStudents = nonDropped.filter((e) => e.status === 'active').length
    const completedCount = nonDropped.filter((e) => e.status === 'completed').length
    const completionRate = totalEnrollments > 0 ? Math.round((completedCount / totalEnrollments) * 100) : 0

    const averageGrade = this.computeAverageGrade(quizAttempts, submissions)
    const moduleCompletions = this.computeModuleCompletions(modules, nonDropped)
    const mostDifficultQuiz = this.computeMostDifficultQuiz(quizAttempts)
    const atRiskStudents = this.computeAtRiskStudents(nonDropped, totalLessons, quizAttempts, submissions)

    return {
      totalEnrollments,
      activeStudents,
      completionRate,
      averageGrade,
      moduleCompletions,
      mostDifficultQuiz,
      atRiskStudents,
    }
  }

  async getInstructorOverview(instructorId: string): Promise<InstructorOverview> {
    const courses = await this.deps.getCoursesByInstructor(instructorId)
    if (courses.length === 0) {
      return { totalCourses: 0, totalStudents: 0, averageCompletionRate: 0 }
    }

    const analytics = await Promise.all(courses.map((c) => this.getCourseAnalytics(c.id)))
    const totalStudents = analytics.reduce((sum, a) => sum + a.totalEnrollments, 0)
    const avgCompletion =
      analytics.length > 0
        ? Math.round(analytics.reduce((sum, a) => sum + a.completionRate, 0) / analytics.length)
        : 0

    return {
      totalCourses: courses.length,
      totalStudents,
      averageCompletionRate: avgCompletion,
    }
  }

  private computeAverageGrade(
    quizAttempts: QuizAttemptRecord[],
    submissions: SubmissionRecord[],
  ): number | null {
    const quizAvg = quizAttempts.length > 0
      ? quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length
      : null

    const gradedSubmissions = submissions.filter((s) => s.grade !== null)
    const assignmentAvg = gradedSubmissions.length > 0
      ? gradedSubmissions.reduce((sum, s) => sum + ((s.grade! / s.maxScore) * 100), 0) / gradedSubmissions.length
      : null

    if (quizAvg === null && assignmentAvg === null) return null
    if (quizAvg === null) return Math.round(assignmentAvg!)
    if (assignmentAvg === null) return Math.round(quizAvg)
    return Math.round(quizAvg * QUIZ_WEIGHT + assignmentAvg * ASSIGNMENT_WEIGHT)
  }

  private computeModuleCompletions(
    modules: ModuleRecord[],
    enrollments: EnrollmentRecord[],
  ): ModuleCompletion[] {
    if (enrollments.length === 0) return modules.map((m) => ({ moduleId: m.id, moduleTitle: m.title, completionRate: 0 }))

    return modules.map((mod) => {
      if (mod.lessonIds.length === 0) {
        return { moduleId: mod.id, moduleTitle: mod.title, completionRate: 0 }
      }
      const rates = enrollments.map((e) => {
        const completed = mod.lessonIds.filter((lid) => e.completedLessonIds.includes(lid)).length
        return completed / mod.lessonIds.length
      })
      const avgRate = Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 100)
      return { moduleId: mod.id, moduleTitle: mod.title, completionRate: avgRate }
    })
  }

  private computeMostDifficultQuiz(
    attempts: QuizAttemptRecord[],
  ): { quizId: string; quizTitle: string; averageScore: number } | null {
    if (attempts.length === 0) return null

    const quizScores = new Map<string, { title: string; scores: number[] }>()
    for (const a of attempts) {
      const entry = quizScores.get(a.quizId) ?? { title: a.quizTitle, scores: [] }
      entry.scores.push(a.score)
      quizScores.set(a.quizId, entry)
    }

    let hardest: { quizId: string; quizTitle: string; averageScore: number } | null = null
    for (const [quizId, { title, scores }] of quizScores) {
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      if (!hardest || avg < hardest.averageScore) {
        hardest = { quizId, quizTitle: title, averageScore: avg }
      }
    }
    return hardest
  }

  private computeAtRiskStudents(
    enrollments: EnrollmentRecord[],
    totalLessons: number,
    quizAttempts: QuizAttemptRecord[],
    submissions: SubmissionRecord[],
  ): AtRiskStudent[] {
    const activeEnrollments = enrollments.filter((e) => e.status === 'active')
    const result: AtRiskStudent[] = []

    for (const enrollment of activeEnrollments) {
      const progressPct = totalLessons > 0
        ? Math.round((enrollment.completedLessonIds.length / totalLessons) * 100)
        : 0

      const studentQuizzes = quizAttempts.filter((a) => a.userId === enrollment.studentId)
      const studentSubmissions = submissions.filter((s) => s.studentId === enrollment.studentId && s.grade !== null)
      const avgGrade = this.computeAverageGrade(studentQuizzes, studentSubmissions)

      const lowProgress = progressPct < PROGRESS_THRESHOLD
      const lowGrade = avgGrade !== null && avgGrade < PASSING_GRADE

      if (lowProgress || lowGrade) {
        result.push({
          studentId: enrollment.studentId,
          studentName: enrollment.studentName,
          progressPercentage: progressPct,
          averageGrade: avgGrade,
          reason: lowProgress && lowGrade ? 'both' : lowProgress ? 'low-progress' : 'low-grade',
        })
      }
    }

    return result
  }
}
```

---

## Step 2: Write tests for analytics service

**File:** `src/services/analytics.test.ts`
**Change:** Write comprehensive Vitest tests covering: completion rate with various enrollment states, grade averaging (quiz only, assignment only, weighted), module completion breakdown, most difficult quiz identification, at-risk student identification, instructor overview aggregation, and edge cases (empty data, all dropped, no grades).
**Why:** TDD — tests first, validating all computation paths before building UI.
**Verify:** `pnpm vitest run src/services/analytics.test.ts --config ./vitest.config.mts`

**Complete code:**
```typescript
import { describe, it, expect } from 'vitest'
import {
  AnalyticsService,
  EnrollmentRecord,
  ModuleRecord,
  QuizAttemptRecord,
  SubmissionRecord,
  AnalyticsServiceDeps,
} from './analytics'

// ─── Test helpers ─────────────────────────────────────────────────────────────

function makeDeps(overrides: Partial<AnalyticsServiceDeps> = {}): AnalyticsServiceDeps {
  return {
    getEnrollmentsByCourse: async () => [],
    getModulesByCourse: async () => [],
    getTotalLessonsByCourse: async () => 0,
    getQuizAttemptsByCourse: async () => [],
    getSubmissionsByCourse: async () => [],
    getCoursesByInstructor: async () => [],
    ...overrides,
  }
}

function enrollment(overrides: Partial<EnrollmentRecord> = {}): EnrollmentRecord {
  return {
    id: 'e1',
    studentId: 's1',
    studentName: 'Student 1',
    status: 'active',
    completedLessonIds: [],
    ...overrides,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AnalyticsService', () => {
  describe('getCourseAnalytics', () => {
    it('returns zeros for a course with no enrollments', async () => {
      const svc = new AnalyticsService(makeDeps())
      const result = await svc.getCourseAnalytics('c1')
      expect(result.totalEnrollments).toBe(0)
      expect(result.activeStudents).toBe(0)
      expect(result.completionRate).toBe(0)
      expect(result.averageGrade).toBeNull()
      expect(result.atRiskStudents).toEqual([])
    })

    it('excludes dropped enrollments from counts', async () => {
      const svc = new AnalyticsService(makeDeps({
        getEnrollmentsByCourse: async () => [
          enrollment({ id: 'e1', studentId: 's1', status: 'active' }),
          enrollment({ id: 'e2', studentId: 's2', status: 'dropped' }),
          enrollment({ id: 'e3', studentId: 's3', status: 'completed' }),
        ],
      }))
      const result = await svc.getCourseAnalytics('c1')
      expect(result.totalEnrollments).toBe(2)
      expect(result.activeStudents).toBe(1)
    })

    it('computes completion rate from non-dropped enrollments', async () => {
      const svc = new AnalyticsService(makeDeps({
        getEnrollmentsByCourse: async () => [
          enrollment({ id: 'e1', status: 'completed' }),
          enrollment({ id: 'e2', studentId: 's2', status: 'active' }),
          enrollment({ id: 'e3', studentId: 's3', status: 'completed' }),
          enrollment({ id: 'e4', studentId: 's4', status: 'dropped' }),
        ],
      }))
      const result = await svc.getCourseAnalytics('c1')
      // 2 completed / 3 non-dropped = 67%
      expect(result.completionRate).toBe(67)
    })

    it('computes weighted average grade from quizzes and assignments', async () => {
      const svc = new AnalyticsService(makeDeps({
        getEnrollmentsByCourse: async () => [enrollment()],
        getQuizAttemptsByCourse: async () => [
          { quizId: 'q1', quizTitle: 'Q1', userId: 's1', score: 80 },
          { quizId: 'q1', quizTitle: 'Q1', userId: 's2', score: 60 },
        ],
        getSubmissionsByCourse: async () => [
          { studentId: 's1', grade: 90, maxScore: 100 },
          { studentId: 's2', grade: 70, maxScore: 100 },
        ],
      }))
      const result = await svc.getCourseAnalytics('c1')
      // Quiz avg: 70, Assignment avg: 80. Weighted: 70*0.4 + 80*0.6 = 76
      expect(result.averageGrade).toBe(76)
    })

    it('returns quiz-only average when no graded submissions', async () => {
      const svc = new AnalyticsService(makeDeps({
        getEnrollmentsByCourse: async () => [enrollment()],
        getQuizAttemptsByCourse: async () => [
          { quizId: 'q1', quizTitle: 'Q1', userId: 's1', score: 85 },
        ],
      }))
      const result = await svc.getCourseAnalytics('c1')
      expect(result.averageGrade).toBe(85)
    })

    it('returns assignment-only average when no quiz attempts', async () => {
      const svc = new AnalyticsService(makeDeps({
        getEnrollmentsByCourse: async () => [enrollment()],
        getSubmissionsByCourse: async () => [
          { studentId: 's1', grade: 45, maxScore: 50 },
        ],
      }))
      const result = await svc.getCourseAnalytics('c1')
      // 45/50 * 100 = 90
      expect(result.averageGrade).toBe(90)
    })

    it('computes module-by-module completion breakdown', async () => {
      const modules: ModuleRecord[] = [
        { id: 'm1', title: 'Module 1', lessonIds: ['l1', 'l2'] },
        { id: 'm2', title: 'Module 2', lessonIds: ['l3', 'l4'] },
      ]
      const svc = new AnalyticsService(makeDeps({
        getEnrollmentsByCourse: async () => [
          enrollment({ id: 'e1', studentId: 's1', completedLessonIds: ['l1', 'l2', 'l3'] }),
          enrollment({ id: 'e2', studentId: 's2', completedLessonIds: ['l1'] }),
        ],
        getModulesByCourse: async () => modules,
      }))
      const result = await svc.getCourseAnalytics('c1')
      // Module 1: s1=2/2=100%, s2=1/2=50%, avg=75%
      expect(result.moduleCompletions[0]).toEqual({ moduleId: 'm1', moduleTitle: 'Module 1', completionRate: 75 })
      // Module 2: s1=1/2=50%, s2=0/2=0%, avg=25%
      expect(result.moduleCompletions[1]).toEqual({ moduleId: 'm2', moduleTitle: 'Module 2', completionRate: 25 })
    })

    it('identifies the most difficult quiz', async () => {
      const svc = new AnalyticsService(makeDeps({
        getEnrollmentsByCourse: async () => [enrollment()],
        getQuizAttemptsByCourse: async () => [
          { quizId: 'q1', quizTitle: 'Easy Quiz', userId: 's1', score: 90 },
          { quizId: 'q1', quizTitle: 'Easy Quiz', userId: 's2', score: 80 },
          { quizId: 'q2', quizTitle: 'Hard Quiz', userId: 's1', score: 40 },
          { quizId: 'q2', quizTitle: 'Hard Quiz', userId: 's2', score: 30 },
        ],
      }))
      const result = await svc.getCourseAnalytics('c1')
      expect(result.mostDifficultQuiz).toEqual({ quizId: 'q2', quizTitle: 'Hard Quiz', averageScore: 35 })
    })

    it('identifies at-risk students with low progress', async () => {
      const svc = new AnalyticsService(makeDeps({
        getEnrollmentsByCourse: async () => [
          enrollment({ id: 'e1', studentId: 's1', studentName: 'Alice', completedLessonIds: ['l1'] }),
        ],
        getTotalLessonsByCourse: async () => 10,
      }))
      const result = await svc.getCourseAnalytics('c1')
      expect(result.atRiskStudents).toHaveLength(1)
      expect(result.atRiskStudents[0].reason).toBe('low-progress')
      expect(result.atRiskStudents[0].progressPercentage).toBe(10)
    })

    it('identifies at-risk students with low grade', async () => {
      const svc = new AnalyticsService(makeDeps({
        getEnrollmentsByCourse: async () => [
          enrollment({ id: 'e1', studentId: 's1', studentName: 'Bob', completedLessonIds: ['l1', 'l2', 'l3', 'l4', 'l5'] }),
        ],
        getTotalLessonsByCourse: async () => 10,
        getQuizAttemptsByCourse: async () => [
          { quizId: 'q1', quizTitle: 'Q1', userId: 's1', score: 40 },
        ],
      }))
      const result = await svc.getCourseAnalytics('c1')
      expect(result.atRiskStudents).toHaveLength(1)
      expect(result.atRiskStudents[0].reason).toBe('both')
    })

    it('does not flag completed enrollments as at-risk', async () => {
      const svc = new AnalyticsService(makeDeps({
        getEnrollmentsByCourse: async () => [
          enrollment({ id: 'e1', studentId: 's1', status: 'completed', completedLessonIds: ['l1'] }),
        ],
        getTotalLessonsByCourse: async () => 10,
      }))
      const result = await svc.getCourseAnalytics('c1')
      expect(result.atRiskStudents).toHaveLength(0)
    })
  })

  describe('getInstructorOverview', () => {
    it('returns zeros when instructor has no courses', async () => {
      const svc = new AnalyticsService(makeDeps())
      const result = await svc.getInstructorOverview('i1')
      expect(result).toEqual({ totalCourses: 0, totalStudents: 0, averageCompletionRate: 0 })
    })

    it('aggregates across multiple courses', async () => {
      const enrollmentsByCourse: Record<string, EnrollmentRecord[]> = {
        c1: [
          enrollment({ id: 'e1', studentId: 's1', status: 'completed' }),
          enrollment({ id: 'e2', studentId: 's2', status: 'active' }),
        ],
        c2: [
          enrollment({ id: 'e3', studentId: 's3', status: 'completed' }),
        ],
      }
      const svc = new AnalyticsService(makeDeps({
        getCoursesByInstructor: async () => [{ id: 'c1' }, { id: 'c2' }],
        getEnrollmentsByCourse: async (courseId) => enrollmentsByCourse[courseId] ?? [],
      }))
      const result = await svc.getInstructorOverview('i1')
      expect(result.totalCourses).toBe(2)
      expect(result.totalStudents).toBe(3)
      // c1: 1/2=50%, c2: 1/1=100%, avg=75%
      expect(result.averageCompletionRate).toBe(75)
    })
  })
})
```

---

## Step 3: Create AnalyticsCard component

**File:** `src/components/analytics/AnalyticsCard.tsx`
**Change:** Create a presentational card component displaying a label, value, and optional trend indicator (up/down/neutral).
**Why:** Reusable stat display for the dashboard.
**Verify:** `npx tsc --noEmit`

**Complete code:**
```tsx
'use client'

export type TrendDirection = 'up' | 'down' | 'neutral'

interface AnalyticsCardProps {
  label: string
  value: string | number
  trend?: TrendDirection
}

const trendSymbols: Record<TrendDirection, string> = {
  up: '\u2191',
  down: '\u2193',
  neutral: '\u2192',
}

const trendColors: Record<TrendDirection, string> = {
  up: '#16a34a',
  down: '#dc2626',
  neutral: '#6b7280',
}

export function AnalyticsCard({ label, value, trend }: AnalyticsCardProps) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', minWidth: '180px' }}>
      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
        <span style={{ fontSize: '28px', fontWeight: 700 }}>{value}</span>
        {trend && (
          <span style={{ fontSize: '18px', color: trendColors[trend] }} aria-label={`Trend: ${trend}`}>
            {trendSymbols[trend]}
          </span>
        )}
      </div>
    </div>
  )
}
```

---

## Step 4: Create CompletionChart component

**File:** `src/components/analytics/CompletionChart.tsx`
**Change:** Create a simple CSS bar chart component that renders horizontal bars for module completion rates.
**Why:** Visual display of module-by-module progress without adding a charting library dependency.
**Verify:** `npx tsc --noEmit`

**Complete code:**
```tsx
'use client'

import type { ModuleCompletion } from '@/services/analytics'

interface CompletionChartProps {
  modules: ModuleCompletion[]
}

export function CompletionChart({ modules }: CompletionChartProps) {
  if (modules.length === 0) {
    return <p style={{ color: '#6b7280' }}>No modules to display.</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{ margin: 0, fontSize: '16px' }}>Module Completion Rates</h3>
      {modules.map((mod) => (
        <div key={mod.moduleId}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
            <span>{mod.moduleTitle}</span>
            <span>{mod.completionRate}%</span>
          </div>
          <div style={{ background: '#e5e7eb', borderRadius: '4px', height: '20px', overflow: 'hidden' }}>
            <div
              style={{
                background: mod.completionRate >= 70 ? '#16a34a' : mod.completionRate >= 40 ? '#eab308' : '#dc2626',
                height: '100%',
                width: `${mod.completionRate}%`,
                borderRadius: '4px',
                transition: 'width 0.3s ease',
              }}
              role="progressbar"
              aria-valuenow={mod.completionRate}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${mod.moduleTitle}: ${mod.completionRate}% complete`}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## Step 5: Create AtRiskStudentsList component

**File:** `src/components/analytics/AtRiskStudentsList.tsx`
**Change:** Create a table component showing at-risk students with their progress, grade, and risk reason.
**Why:** Actionable table for instructors to identify students needing intervention.
**Verify:** `npx tsc --noEmit`

**Complete code:**
```tsx
'use client'

import type { AtRiskStudent } from '@/services/analytics'

interface AtRiskStudentsListProps {
  students: AtRiskStudent[]
}

const reasonLabels: Record<AtRiskStudent['reason'], string> = {
  'low-progress': 'Low Progress',
  'low-grade': 'Low Grade',
  'both': 'Low Progress & Grade',
}

export function AtRiskStudentsList({ students }: AtRiskStudentsListProps) {
  if (students.length === 0) {
    return <p style={{ color: '#6b7280' }}>No at-risk students. Great job!</p>
  }

  return (
    <div>
      <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>Students at Risk</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
            <th style={{ padding: '8px' }}>Student</th>
            <th style={{ padding: '8px' }}>Progress</th>
            <th style={{ padding: '8px' }}>Avg Grade</th>
            <th style={{ padding: '8px' }}>Reason</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.studentId} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '8px' }}>{s.studentName}</td>
              <td style={{ padding: '8px' }}>{s.progressPercentage}%</td>
              <td style={{ padding: '8px' }}>{s.averageGrade !== null ? `${s.averageGrade}%` : 'N/A'}</td>
              <td style={{ padding: '8px' }}>
                <span style={{
                  background: s.reason === 'both' ? '#fef2f2' : s.reason === 'low-grade' ? '#fffbeb' : '#fef2f2',
                  color: s.reason === 'both' ? '#dc2626' : s.reason === 'low-grade' ? '#d97706' : '#dc2626',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}>
                  {reasonLabels[s.reason]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## Step 6: Create instructor analytics page

**File:** `src/app/(frontend)/instructor/analytics/page.tsx`
**Change:** Create the dashboard page as a React Server Component. It reads the instructor's ID from the auth session (placeholder for now since full auth isn't wired), then renders the overview cards, completion chart, and at-risk table. Uses the analytics service with Payload-backed dependency implementations.
**Why:** The main entry point that ties the service and components together.
**Verify:** `npx tsc --noEmit`

**Complete code:**
```tsx
import { AnalyticsCard } from '@/components/analytics/AnalyticsCard'
import { CompletionChart } from '@/components/analytics/CompletionChart'
import { AtRiskStudentsList } from '@/components/analytics/AtRiskStudentsList'
import { AnalyticsService } from '@/services/analytics'
import type { AnalyticsServiceDeps, EnrollmentRecord, ModuleRecord, QuizAttemptRecord, SubmissionRecord } from '@/services/analytics'
import { getPayloadInstance } from '@/services/progress'
import type { CollectionSlug } from 'payload'

function createPayloadDeps(): AnalyticsServiceDeps {
  return {
    getEnrollmentsByCourse: async (courseId: string): Promise<EnrollmentRecord[]> => {
      const payload = await getPayloadInstance()
      const { docs } = await payload.find({
        collection: 'enrollments' as CollectionSlug,
        where: { course: { equals: courseId } },
        limit: 0,
      })
      return (docs as Record<string, unknown>[]).map((doc) => ({
        id: String(doc.id),
        studentId: String((doc.student as { id: string })?.id ?? doc.student),
        studentName: (doc.student as { name?: string })?.name ?? 'Unknown',
        status: doc.status as EnrollmentRecord['status'],
        completedLessonIds: ((doc.completedLessons ?? []) as (string | { id: string })[]).map(
          (l) => (typeof l === 'string' ? l : l.id),
        ),
      }))
    },

    getModulesByCourse: async (courseId: string): Promise<ModuleRecord[]> => {
      const payload = await getPayloadInstance()
      const { docs: modules } = await payload.find({
        collection: 'modules' as CollectionSlug,
        where: { courseId: { equals: courseId } },
        limit: 0,
      })
      const moduleDocs = modules as Record<string, unknown>[]
      const result: ModuleRecord[] = []
      for (const mod of moduleDocs) {
        const { docs: lessons } = await payload.find({
          collection: 'lessons' as CollectionSlug,
          where: { course: { equals: courseId } },
          limit: 0,
        })
        result.push({
          id: String(mod.id),
          title: String(mod.title),
          lessonIds: (lessons as { id: string }[]).map((l) => String(l.id)),
        })
      }
      return result
    },

    getTotalLessonsByCourse: async (courseId: string): Promise<number> => {
      const payload = await getPayloadInstance()
      const { totalDocs } = await payload.find({
        collection: 'lessons' as CollectionSlug,
        where: { course: { equals: courseId } },
        limit: 0,
      })
      return totalDocs
    },

    getQuizAttemptsByCourse: async (courseId: string): Promise<QuizAttemptRecord[]> => {
      const payload = await getPayloadInstance()
      const { docs: modules } = await payload.find({
        collection: 'modules' as CollectionSlug,
        where: { courseId: { equals: courseId } },
        limit: 0,
      })
      const moduleIds = (modules as { id: string }[]).map((m) => String(m.id))
      if (moduleIds.length === 0) return []

      const { docs: quizzes } = await payload.find({
        collection: 'quizzes' as CollectionSlug,
        where: { module: { in: moduleIds } },
        limit: 0,
      })
      const quizIds = (quizzes as { id: string }[]).map((q) => String(q.id))
      if (quizIds.length === 0) return []

      const quizMap = new Map((quizzes as { id: string; title: string }[]).map((q) => [String(q.id), q.title]))

      const { docs: attempts } = await payload.find({
        collection: 'quiz-attempts' as CollectionSlug,
        where: { quiz: { in: quizIds } },
        limit: 0,
      })
      return (attempts as Record<string, unknown>[]).map((a) => ({
        quizId: String(a.quiz),
        quizTitle: quizMap.get(String(a.quiz)) ?? 'Unknown',
        userId: String(a.user),
        score: Number(a.score ?? 0),
      }))
    },

    getSubmissionsByCourse: async (courseId: string): Promise<SubmissionRecord[]> => {
      const payload = await getPayloadInstance()
      const { docs: modules } = await payload.find({
        collection: 'modules' as CollectionSlug,
        where: { courseId: { equals: courseId } },
        limit: 0,
      })
      const moduleIds = (modules as { id: string }[]).map((m) => String(m.id))
      if (moduleIds.length === 0) return []

      const { docs: assignments } = await payload.find({
        collection: 'assignments' as CollectionSlug,
        where: { module: { in: moduleIds } },
        limit: 0,
      })
      const assignmentIds = (assignments as { id: string }[]).map((a) => String(a.id))
      const maxScoreMap = new Map((assignments as { id: string; maxScore: number }[]).map((a) => [String(a.id), a.maxScore]))
      if (assignmentIds.length === 0) return []

      const { docs: submissions } = await payload.find({
        collection: 'submissions' as CollectionSlug,
        where: { assignment: { in: assignmentIds } },
        limit: 0,
      })
      return (submissions as Record<string, unknown>[]).map((s) => ({
        studentId: String((s.student as { id: string })?.id ?? s.student),
        grade: s.grade != null ? Number(s.grade) : null,
        maxScore: maxScoreMap.get(String((s.assignment as { id: string })?.id ?? s.assignment)) ?? 100,
      }))
    },

    getCoursesByInstructor: async (instructorId: string): Promise<{ id: string }[]> => {
      const payload = await getPayloadInstance()
      const { docs } = await payload.find({
        collection: 'courses' as CollectionSlug,
        where: { instructor: { equals: instructorId } },
        limit: 0,
      })
      return (docs as { id: string }[]).map((d) => ({ id: String(d.id) }))
    },
  }
}

export default async function InstructorAnalyticsPage() {
  // TODO: Read instructor ID from auth session once wired
  const instructorId = 'placeholder'

  const deps = createPayloadDeps()
  const svc = new AnalyticsService(deps)

  const overview = await svc.getInstructorOverview(instructorId)
  const courses = await deps.getCoursesByInstructor(instructorId)
  const courseAnalytics = courses.length > 0 ? await svc.getCourseAnalytics(courses[0].id) : null

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>Instructor Analytics</h1>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Overview</h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <AnalyticsCard label="Total Courses" value={overview.totalCourses} />
          <AnalyticsCard label="Total Students" value={overview.totalStudents} />
          <AnalyticsCard label="Avg Completion Rate" value={`${overview.averageCompletionRate}%`} />
        </div>
      </section>

      {courseAnalytics && (
        <>
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Course Details</h2>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <AnalyticsCard label="Enrollments" value={courseAnalytics.totalEnrollments} />
              <AnalyticsCard label="Active Students" value={courseAnalytics.activeStudents} />
              <AnalyticsCard label="Completion Rate" value={`${courseAnalytics.completionRate}%`} />
              <AnalyticsCard label="Avg Grade" value={courseAnalytics.averageGrade !== null ? `${courseAnalytics.averageGrade}%` : 'N/A'} />
              {courseAnalytics.mostDifficultQuiz && (
                <AnalyticsCard label="Hardest Quiz" value={`${courseAnalytics.mostDifficultQuiz.quizTitle} (${courseAnalytics.mostDifficultQuiz.averageScore}%)`} />
              )}
            </div>
          </section>

          <section style={{ marginBottom: '32px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
            <CompletionChart modules={courseAnalytics.moduleCompletions} />
          </section>

          <section style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
            <AtRiskStudentsList students={courseAnalytics.atRiskStudents} />
          </section>
        </>
      )}

      {!courseAnalytics && courses.length === 0 && (
        <p style={{ color: '#6b7280' }}>No courses found. Create a course to see analytics.</p>
      )}
    </div>
  )
}
```

---

## Step 7: Write component tests

**File:** `src/components/analytics/AnalyticsCard.test.tsx`
**Change:** Test that AnalyticsCard renders label, value, and trend indicator correctly.
**Verify:** `pnpm vitest run src/components/analytics/AnalyticsCard.test.tsx --config ./vitest.config.mts`

**Complete code:**
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AnalyticsCard } from './AnalyticsCard'

describe('AnalyticsCard', () => {
  it('renders label and value', () => {
    render(<AnalyticsCard label="Total Students" value={42} />)
    expect(screen.getByText('Total Students')).toBeDefined()
    expect(screen.getByText('42')).toBeDefined()
  })

  it('renders trend indicator when provided', () => {
    render(<AnalyticsCard label="Rate" value="75%" trend="up" />)
    expect(screen.getByLabelText('Trend: up')).toBeDefined()
  })

  it('does not render trend when not provided', () => {
    render(<AnalyticsCard label="Rate" value="75%" />)
    expect(screen.queryByLabelText(/Trend/)).toBeNull()
  })
})
```

---

## Step 8: Write AtRiskStudentsList component test

**File:** `src/components/analytics/AtRiskStudentsList.test.tsx`
**Change:** Test the table renders students correctly and shows empty state.
**Verify:** `pnpm vitest run src/components/analytics/AtRiskStudentsList.test.tsx --config ./vitest.config.mts`

**Complete code:**
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AtRiskStudentsList } from './AtRiskStudentsList'

describe('AtRiskStudentsList', () => {
  it('renders empty state when no students', () => {
    render(<AtRiskStudentsList students={[]} />)
    expect(screen.getByText(/No at-risk students/)).toBeDefined()
  })

  it('renders student rows with data', () => {
    render(<AtRiskStudentsList students={[
      { studentId: 's1', studentName: 'Alice', progressPercentage: 20, averageGrade: 45, reason: 'both' },
      { studentId: 's2', studentName: 'Bob', progressPercentage: 30, averageGrade: null, reason: 'low-progress' },
    ]} />)
    expect(screen.getByText('Alice')).toBeDefined()
    expect(screen.getByText('Bob')).toBeDefined()
    expect(screen.getByText('Low Progress & Grade')).toBeDefined()
    expect(screen.getByText('Low Progress')).toBeDefined()
    expect(screen.getByText('N/A')).toBeDefined()
  })
})
```

---

## Step 9: Run all tests and verify TypeScript

**File:** N/A
**Change:** Run the full test suite and TypeScript check.
**Why:** Ensure everything compiles and all tests pass.
**Verify:** `npx tsc --noEmit && pnpm vitest run --config ./vitest.config.mts --exclude 'tests/int/**'`

---

## Questions

- **Quiz weight vs assignment weight:** I've defaulted to 40% quiz / 60% assignment for weighted grade averaging (assignments are typically more substantial). Approve this weighting, or adjust?
- **Module-lesson mapping:** The `Lessons` collection has a `course` relationship but no `module` field. The `Modules` collection is an in-memory store with `courseId`. For module-by-module completion, the page currently queries lessons per course (not per module). Should we add a `module` field to the Lessons collection, or is the current approach acceptable for now?
