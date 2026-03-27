'use client'

import styles from './ContactAvatar.module.css'

const COLORS = [
  '#6c63ff', '#ff6b6b', '#4ecdc4', '#ffd93d', '#6bcb77',
  '#4d96ff', '#ff8fb1', '#a66cff', '#ff7840', '#38b000',
]

function hashName(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

interface ContactAvatarProps {
  firstName: string
  lastName?: string
  size?: number
}

export function ContactAvatar({ firstName, lastName = '', size = 40 }: ContactAvatarProps) {
  const initials = `${firstName.charAt(0).toUpperCase()}${lastName ? lastName.charAt(0).toUpperCase() : ''}`
  const colorIndex = hashName(`${firstName}${lastName}`) % COLORS.length
  const bg = COLORS[colorIndex]

  return (
    <div
      className={styles.avatar}
      style={{ backgroundColor: bg, width: size, height: size, fontSize: size * 0.4 }}
      aria-label={`${firstName} ${lastName}`}
    >
      {initials}
    </div>
  )
}
