'use client'

import type { GradeDistribution } from '@/services/dashboard-stats'

interface GradesChartProps {
  data: GradeDistribution[]
}

const RANGE_COLORS: Record<string, string> = {
  '90-100': '#16a34a',
  '80-89': '#2563eb',
  '70-79': '#7c3aed',
  '60-69': '#d97706',
  '< 60': '#dc2626',
}

export function GradesChart({ data }: GradesChartProps) {
  if (!data || data.length === 0) {
    return <p style={{ color: '#9ca3af', textAlign: 'center' }}>No grade data available.</p>
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1)
  const barHeight = 32
  const gap = 12
  const labelWidth = 60
  const chartHeight = data.length * (barHeight + gap)
  const maxBarWidth = 400

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${maxBarWidth + labelWidth + 80} ${chartHeight}`}
        style={{ width: '100%', minWidth: 300, height: 'auto', display: 'block' }}
        role="img"
        aria-label="Grade distribution chart"
      >
        {data.map((bucket, i) => {
          const barWidth = (bucket.count / maxCount) * maxBarWidth
          const y = i * (barHeight + gap)
          const color = RANGE_COLORS[bucket.range] ?? '#6366f1'

          return (
            <g key={bucket.range}>
              {/* Label */}
              <text
                x={labelWidth - 8}
                y={y + barHeight / 2 + 4}
                textAnchor="end"
                fontSize={13}
                fill="#374151"
                fontWeight={500}
              >
                {bucket.range}
              </text>

              {/* Bar background */}
              <rect
                x={labelWidth}
                y={y}
                width={maxBarWidth}
                height={barHeight}
                fill="#f3f4f6"
                rx={4}
              />

              {/* Bar fill */}
              {bucket.count > 0 && (
                <rect
                  x={labelWidth}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={color}
                  rx={4}
                  opacity={0.85}
                />
              )}

              {/* Count label */}
              <text
                x={labelWidth + maxBarWidth + 8}
                y={y + barHeight / 2 + 4}
                fontSize={13}
                fill="#374151"
              >
                {bucket.count} ({bucket.percentage}%)
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
