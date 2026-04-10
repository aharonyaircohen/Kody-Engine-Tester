'use client'

import Link from 'next/link'
import styles from './Breadcrumb.module.css'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={index} className={styles.item}>
              {isLast || !item.href ? (
                <span className={isLast ? styles.active : styles.text}>{item.label}</span>
              ) : (
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              )}
              {!isLast && <span className={styles.separator} aria-hidden="true">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}