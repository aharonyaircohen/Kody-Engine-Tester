'use client'

import styles from './TagBadge.module.css'

export function TagBadge({ tag }: { tag: string }) {
  return <span className={styles.badge}>{tag}</span>
}
