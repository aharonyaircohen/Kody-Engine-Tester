interface ProgressRingProps {
  percentage: number
  size?: number
}

export function ProgressRing({ percentage, size = 80 }: ProgressRingProps) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="8"
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 50 50)"
      />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="18"
        fontWeight="bold"
        fill="#1f2937"
      >
        {percentage}%
      </text>
    </svg>
  )
}
