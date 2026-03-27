'use client'

import { useEffect, useMemo } from 'react'
import { debounce } from '../../utils/debounce'
import styles from './SearchBar.module.css'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
}

export function SearchBar({ value, onChange, placeholder = 'Search contacts...', debounceMs = 300 }: SearchBarProps) {
  const debouncedOnChange = useMemo(() => debounce(onChange, debounceMs), [onChange, debounceMs])

  useEffect(() => {
    debouncedOnChange(value)
  }, [value, debouncedOnChange])

  return (
    <input
      className={styles.input}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label="Search contacts"
    />
  )
}
