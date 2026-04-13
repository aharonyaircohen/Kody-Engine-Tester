'use client'

import Link from 'next/link'
import { DarkModeToggle } from './dark-mode-toggle'

export function Header() {
  return (
    <header className="header">
      <nav className="header-nav">
        <Link href="/" className="header-logo">
          LearnHub
        </Link>
        <div className="header-actions">
          <DarkModeToggle />
        </div>
      </nav>
    </header>
  )
}
