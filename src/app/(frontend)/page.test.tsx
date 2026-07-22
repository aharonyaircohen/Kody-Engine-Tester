import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import HomePage from './page'

const { auth } = vi.hoisted(() => ({ auth: vi.fn() }))

vi.mock('next/headers.js', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}))

vi.mock('payload', () => ({
  getPayload: vi.fn().mockResolvedValue({ auth }),
}))

vi.mock('@/payload.config', () => ({
  default: Promise.resolve({ routes: { admin: '/admin' } }),
}))

describe('HomePage', () => {
  beforeEach(() => {
    auth.mockReset()
  })

  it('renders the Agency runtime verification marker for guests', async () => {
    auth.mockResolvedValue({ user: null })

    render(await HomePage())

    expect(screen.getByRole('heading', { name: 'Welcome from kody — Agency runtime verified for issue 3904' })).toBeDefined()
  })

  it('renders the authenticated greeting without the verification marker', async () => {
    auth.mockResolvedValue({ user: { email: 'learner@example.com' } })

    render(await HomePage())

    expect(screen.getByRole('heading', { name: 'Welcome back, learner@example.com' })).toBeDefined()
    expect(screen.queryByText(/Agency runtime verified/)).toBeNull()
  })
})
