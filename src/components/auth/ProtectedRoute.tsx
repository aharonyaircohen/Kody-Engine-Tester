'use client'
import { useContext } from 'react'
import { AuthContext } from '../../contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface Props {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: Props) {
  const { isAuthenticated } = useContext(AuthContext)
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null
  return <>{children}</>
}
