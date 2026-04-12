interface BarChartProps {
  data: Array<{ label: string; value: number; color?: string }>
  width?: number
  height?: number
}

export function BarChart({ data, width = 400, height = 200 }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const barWidth = (width - 40) / data.length - 8
  const chartHeight = height - 40

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Y-axis line */}
      <line x1="35" y1="10" x2="35" y2={chartHeight} stroke="#e5e7eb" strokeWidth="1" />
      {/* X-axis line */}
      <line x1="35" y1={chartHeight} x2={width - 5} y2={chartHeight} stroke="#e5e7eb" strokeWidth="1" />

      {/* Bars */}
      {data.map((item, index) => {
        const barHeight = (item.value / maxValue) * (chartHeight - 20)
        const x = 40 + index * ((width - 45) / data.length)
        const y = chartHeight - barHeight

        return (
          <g key={item.label}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={item.color ?? '#3b82f6'}
              rx="2"
            />
            {/* Value label */}
            <text
              x={x + barWidth / 2}
              y={y - 4}
              textAnchor="middle"
              fontSize="10"
              fill="#1f2937"
            >
              {item.value}
            </text>
            {/* X-axis label */}
            <text
              x={x + barWidth / 2}
              y={chartHeight + 14}
              textAnchor="middle"
              fontSize="10"
              fill="#6b7280"
            >
              {item.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
