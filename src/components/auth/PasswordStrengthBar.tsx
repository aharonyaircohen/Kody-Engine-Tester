interface Props {
  password: string
}

function getStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { score, label: 'Weak', color: '#ef4444' }
  if (score <= 3) return { score, label: 'Medium', color: '#eab308' }
  return { score, label: 'Strong', color: '#22c55e' }
}

export function PasswordStrengthBar({ password }: Props) {
  if (!password) return null
  const { score, label, color } = getStrength(password)
  const width = `${(score / 4) * 100}%`

  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ height: 6, backgroundColor: '#e5e7eb', borderRadius: 3 }}>
        <div style={{ height: '100%', width, backgroundColor: color, borderRadius: 3, transition: 'width 0.2s' }} />
      </div>
      <span style={{ fontSize: 12, color }}>{label}</span>
    </div>
  )
}
