'use client'
import { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../../contexts/auth-context'
import { ProtectedRoute } from '../../components/auth/ProtectedRoute'
import { PasswordStrengthBar } from '../../components/auth/PasswordStrengthBar'
import { SessionCard, type TokenInfo } from '../../components/auth/SessionCard'

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}

function ProfileContent() {
  const { user, logout } = useContext(AuthContext)
  const [sessions, setSessions] = useState<TokenInfo[]>([])
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  useEffect(() => {
    const accessToken = localStorage.getItem('auth_access_token')
    if (!accessToken) return
    fetch('/api/auth/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.json())
      .then(data => { if (data.sessions) setSessions(data.sessions) })
      .catch(() => {})
  }, [])

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    const accessToken = localStorage.getItem('auth_access_token')
    const res = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ newPassword, currentPassword }),
    })
    if (res.ok) {
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } else {
      const data = await res.json()
      setPasswordError(data.error ?? 'Failed to update password')
    }
  }

  async function revokeSession(token: string) {
    const accessToken = localStorage.getItem('auth_access_token')
    await fetch(`/api/auth/sessions/${token}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    setSessions(s => s.filter(x => x.token !== token))
  }

  const currentAccessToken = localStorage.getItem('auth_access_token') ?? ''
  let currentToken = ''
  try {
    const parts = currentAccessToken.split('.')
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
      currentToken = payload.sessionId
    }
  } catch {}

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h1>Profile</h1>
      <section>
        <h2>Account Info</h2>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role}</p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Change Password</h2>
        {passwordSuccess && <p style={{ color: '#22c55e' }}>Password updated successfully</p>}
        {passwordError && <p style={{ color: '#ef4444' }}>{passwordError}</p>}
        <form onSubmit={handlePasswordChange}>
          <div>
            <label>Current Password</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={{ display: 'block', width: '100%', padding: 8 }} />
          </div>
          <div style={{ marginTop: 8 }}>
            <label>New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ display: 'block', width: '100%', padding: 8 }} />
            <PasswordStrengthBar password={newPassword} />
          </div>
          <div style={{ marginTop: 8 }}>
            <label>Confirm New Password</label>
            <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} style={{ display: 'block', width: '100%', padding: 8 }} />
          </div>
          <button type="submit" style={{ marginTop: 12, padding: '8px 16px' }}>Update Password</button>
        </form>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Active Sessions</h2>
        {sessions.map(session => (
          <SessionCard
            key={session.token}
            session={session}
            isCurrentSession={session.token === currentToken}
            onRevoke={revokeSession}
          />
        ))}
        <button onClick={() => logout(true)} style={{ marginTop: 12, padding: '8px 16px', color: '#ef4444' }}>
          Logout All Devices
        </button>
      </section>
    </div>
  )
}