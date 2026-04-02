import React from 'react'

interface WelcomeBannerProps {
  userEmail?: string | null
}

export function WelcomeBanner({ userEmail }: WelcomeBannerProps) {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 12,
        padding: '48px 24px',
        marginBottom: 32,
        textAlign: 'center',
      }}
    >
      <h2
        style={{
          color: '#ffffff',
          fontSize: 42,
          fontWeight: 700,
          margin: '0 0 16px 0',
          lineHeight: 1.2,
        }}
      >
        Welcome to the LMS
      </h2>
      {userEmail && (
        <p
          style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: 18,
            margin: '0 0 24px 0',
          }}
        >
          Hello, {userEmail}
        </p>
      )}
      <a
        href="/courses"
        style={{
          display: 'inline-block',
          backgroundColor: '#ffffff',
          color: '#667eea',
          padding: '12px 32px',
          borderRadius: 6,
          fontWeight: 600,
          fontSize: 16,
          textDecoration: 'none',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        Browse Courses
      </a>
    </div>
  )
}