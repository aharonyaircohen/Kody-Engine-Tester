import { ProgressRing } from './ProgressRing'

interface CourseProgressCardProps {
  courseTitle: string
  percentage: number
  grade: number | null
  nextLessonTitle: string | null
  nextLessonHref: string | null
}

export function CourseProgressCard({
  courseTitle,
  percentage,
  grade,
  nextLessonTitle,
  nextLessonHref,
}: CourseProgressCardProps) {
  return (
    <div className="course-progress-card" style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
      <h3>{courseTitle}</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <ProgressRing percentage={percentage} />
        <div>
          <p>{grade !== null ? `Grade: ${grade}` : 'No grade yet'}</p>
          {percentage >= 100 ? (
            <p>Course completed</p>
          ) : nextLessonTitle && nextLessonHref ? (
            <p>
              Next: <a href={nextLessonHref}>{nextLessonTitle}</a>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
