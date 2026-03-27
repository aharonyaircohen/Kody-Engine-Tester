interface Props {
  title: string
  error?: string
  onSubmit: (e: React.FormEvent) => void
  submitLabel: string
  children: React.ReactNode
}

export function AuthForm({ title, error, onSubmit, submitLabel, children }: Props) {
  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 24 }}>
      <h1>{title}</h1>
      {error && <div role="alert" style={{ color: '#ef4444', marginBottom: 16 }}>{error}</div>}
      <form onSubmit={onSubmit}>
        {children}
        <button type="submit" style={{ width: '100%', padding: '8px 16px', marginTop: 16 }}>
          {submitLabel}
        </button>
      </form>
    </div>
  )
}
