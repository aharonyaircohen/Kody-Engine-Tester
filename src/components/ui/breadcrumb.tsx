'use client'

import styles from './breadcrumb.module.css'

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
              {isLast ? (
                <span aria-current="page" className={styles.active}>
                  {item.label}
                </span>
              ) : (
                <>
                  <a href={item.href} className={styles.link}>
                    {item.label}
                  </a>
                  <span className={styles.separator} aria-hidden="true">
                    /
                  </span>
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}