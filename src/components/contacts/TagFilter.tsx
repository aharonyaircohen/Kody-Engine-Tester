'use client'

import styles from './TagFilter.module.css'

interface TagFilterProps {
  availableTags: string[]
  selectedTags: string[]
  onChange: (selectedTags: string[]) => void
}

export function TagFilter({ availableTags, selectedTags, onChange }: TagFilterProps) {
  function toggleTag(tag: string) {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag))
    } else {
      onChange([...selectedTags, tag])
    }
  }

  return (
    <div className={styles.container} role="group" aria-label="Filter by tags">
      {availableTags.map((tag) => {
        const isSelected = selectedTags.includes(tag)
        return (
          <button
            key={tag}
            type="button"
            className={`${styles.chip} ${isSelected ? styles.active : ''}`}
            onClick={() => toggleTag(tag)}
            aria-pressed={isSelected}
          >
            {tag}
          </button>
        )
      })}
    </div>
  )
}
