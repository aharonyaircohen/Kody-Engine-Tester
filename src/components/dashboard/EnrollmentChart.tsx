'use client'

import type { EnrollmentTrendPoint } from '@/services/dashboard-stats'

interface EnrollmentChartProps {
  data: EnrollmentTrendPoint[]
}

export function EnrollmentChart({ data }: EnrollmentChartProps) {
  if (!data || data.length === 0) {
    return <p style={{ color: '#9ca3af', textAlign: 'center' }}>No enrollment data available.</p>
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1)
  const chartHeight = 180
  const barWidth = Math.max(16, Math.min(40, Math.floor((700 - data.length * 8) / data.length)))
  const chartWidth = data.length * (barWidth + 8) + 60
  const paddingLeft = 40
  const paddingBottom = 30

  const yTicks = [0, Math.ceil(maxCount / 2), maxCount]
  const gridLines = yTicks.map((tick) => {
    const y = chartHeight - (tick / maxCount) * chartHeight
    return { tick, y }
  })

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight + paddingBottom}`}
        style={{ width: '100%', minWidth: 300, height: 'auto', display: 'block' }}
        role="img"
        aria-label="Enrollment trends over the last 12 months"
      >
        {/* Grid lines */}
        {gridLines.map(({ tick, y }) => (
          <g key={tick}>
            <line
              x1={paddingLeft}
              y1={y}
              x2={chartWidth}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
            <text
              x={paddingLeft - 6}
              y={y + 4}
              textAnchor="end"
              fontSize={11}
              fill="#9ca3af"
            >
              {tick}
            </text>
          </g>
        ))}

        {/* X-axis label */}
        <text
          x={paddingLeft + (chartWidth - paddingLeft) / 2}
          y={chartHeight + paddingBottom - 4}
          textAnchor="middle"
          fontSize={11}
          fill="#6b7280"
        >
          Month
        </text>

        {/* Bars */}
        {data.map((point, i) => {
          const barHeight = (point.count / maxCount) * chartHeight
          const x = paddingLeft + i * (barWidth + 8)
          const y = chartHeight - barHeight

          return (
            <g key={point.month}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#6366f1"
                rx={3}
                opacity={0.9}
              />
              {/* Tooltip value on hover handled by CSS */}
              <title>{`${point.month}: ${point.count} enrollments`}</title>
              {/* X-axis labels — show every other month to avoid crowding */}
              {i % 2 === 0 && (
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 16}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#6b7280"
                  transform={`rotate(-30, ${x + barWidth / 2}, ${chartHeight + 16})`}
                >
                  {point.month}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
