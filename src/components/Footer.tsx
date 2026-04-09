'use client'

import styles from './Footer.module.css'

export interface FooterProps {
  copyright?: string
}

export function Footer({ copyright = '© 2026' }: FooterProps) {
  return (
    <footer className={styles.footer} data-testid="footer">
      <div className={styles.content}>
        <span className={styles.copyright}>{copyright}</span>
      </div>
    </footer>
  )
}