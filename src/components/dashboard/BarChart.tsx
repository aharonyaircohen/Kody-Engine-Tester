export interface BarChartData {
  label: string
  value: number
}

interface BarChartProps {
  data: BarChartData[]
  height?: number
}

export function BarChart({ data, height = 200 }: BarChartProps) {
  if (data.length === 0) {
    return <p>No data to display</p>
  }

  const maxValue = Math.max(...data.map((d) => d.value))
  const barWidth = 40
  const barGap = 16
  const chartWidth = data.length * (barWidth + barGap)
  const paddingBottom = 30
  const paddingTop = 10
  const paddingSides = 10
  const scale = maxValue > 0 ? (height - paddingBottom - paddingTop) / maxValue : 0

  return (
    <div>
      <svg
        width={chartWidth + paddingSides * 2}
        height={height}
        viewBox={`0 0 ${chartWidth + paddingSides * 2} ${height}`}
      >
        {data.map((d, i) => {
          const barHeight = d.value * scale
          const x = paddingSides + i * (barWidth + barGap)
          const y = height - paddingBottom - barHeight

          return (
            <g key={d.label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#3b82f6"
                rx={4}
              />
              <text
                x={x + barWidth / 2}
                y={height - 8}
                textAnchor="middle"
                fontSize="12"
                fill="#6b7280"
              >
                {d.label}
              </text>
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize="12"
                fontWeight="bold"
                fill="#1f2937"
              >
                {d.value}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
