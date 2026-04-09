import Link from 'next/link'

interface ErrorPageProps {
  error?: Error
  statusCode?: number
}

export default function ErrorPage({ error, statusCode = 500 }: ErrorPageProps) {
  const isDev = process.env.NODE_ENV === 'development'

  return (
    <div style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem', color: '#cc0000' }}>{statusCode}</div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Something went wrong</h1>
      {error && (
        <p style={{ color: '#cc0000', marginBottom: '1rem', fontFamily: 'monospace' }}>
          {error.message}
        </p>
      )}
      {isDev && error?.stack && (
        <pre
          style={{
            textAlign: 'left',
            background: '#f5f5f5',
            padding: '1rem',
            overflow: 'auto',
            fontSize: '0.8rem',
            borderRadius: '4px',
            marginBottom: '2rem',
          }}
        >
          {error.stack}
        </pre>
      )}
      <Link
        href="/"
        style={{
          padding: '10px 24px',
          backgroundColor: '#6c63ff',
          color: 'white',
          borderRadius: '8px',
          textDecoration: 'none',
          display: 'inline-block',
        }}
      >
        Go Home
      </Link>
    </div>
  )
}
