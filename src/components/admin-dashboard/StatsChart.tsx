'use client'

interface StatsChartProps {
  data: Array<{
    label: string
    value: number
    color?: string
  }>
  title: string
}

export function StatsChart({ data, title }: StatsChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const chartHeight = 200
  const barWidth = 40
  const gap = 20
  const chartWidth = data.length * (barWidth + gap)

  return (
    <div style={{ background: '#1a1a2e', borderRadius: 8, padding: 16, border: '1px solid #2a2a3d' }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#e0e0e0', fontSize: '1rem' }}>{title}</h3>
      <div style={{ overflowX: 'auto' }}>
        <svg width={Math.max(chartWidth, 300)} height={chartHeight + 40}>
          {data.map((item, idx) => {
            const barHeight = (item.value / maxValue) * chartHeight
            const x = idx * (barWidth + gap) + 10
            const y = chartHeight - barHeight + 10

            return (
              <g key={item.label}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={item.color || '#6c63ff'}
                  rx={4}
                />
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 25}
                  textAnchor="middle"
                  fill="#a0a0c0"
                  fontSize="12"
                >
                  {item.label}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fill="#e0e0e0"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {item.value}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}