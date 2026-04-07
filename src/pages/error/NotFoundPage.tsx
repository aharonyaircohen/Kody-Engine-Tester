import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <div style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Page Not Found</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Sorry, the page you&#39;re looking for does not exist.
      </p>
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
