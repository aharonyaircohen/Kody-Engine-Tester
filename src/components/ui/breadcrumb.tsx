'use client'

import styles from './breadcrumb.module.css'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

function ChevronRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={styles.chevron}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumb} data-testid="breadcrumb">
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const isClickable = item.href && !isLast

          return (
            <li key={item.label} className={styles.item}>
              {isClickable ? (
                <a href={item.href} className={styles.link} data-testid="breadcrumb-link">
                  {item.label}
                </a>
              ) : (
                <span
                  className={isLast ? styles.active : styles.text}
                  aria-current={isLast ? 'page' : undefined}
                  data-testid={isLast ? 'breadcrumb-active' : 'breadcrumb-text'}
                >
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRightIcon />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}