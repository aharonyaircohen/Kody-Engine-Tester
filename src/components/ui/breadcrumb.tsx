'use client'

import styles from './breadcrumb.module.css'

export interface BreadcrumbItem {
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
          const isLink = !isLast && item.href

          return (
            <li key={index} className={styles.item}>
              {isLink ? (
                <a href={item.href} className={styles.link}>
                  {item.label}
                </a>
              ) : (
                <span className={isLast ? styles.active : styles.text}>
                  {item.label}
                </span>
              )}
              {!isLast && <span className={styles.separator} aria-hidden="true">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}