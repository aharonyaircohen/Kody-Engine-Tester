import React from 'react'

export default function StatusPage() {
  return (
    <div style={{ fontFamily: 'system-ui', padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px' }}>LearnHub</h1>
      <span
        style={{
          display: 'inline-block',
          padding: '6px 16px',
          borderRadius: '9999px',
          backgroundColor: '#22c55e',
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '14px',
        }}
      >
        Operational
      </span>
    </div>
  )
}