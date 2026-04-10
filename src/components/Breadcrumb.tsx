'use client'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: 'chevron' | 'slash' | 'arrow'
  onNavigate?: (item: BreadcrumbItem, index: number) => void
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
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function SlashIcon() {
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
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="5" />
    </svg>
  )
}

function ArrowRightIcon() {
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
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function SeparatorIcon({ type }: { type: 'chevron' | 'slash' | 'arrow' }) {
  switch (type) {
    case 'slash':
      return <SlashIcon />
    case 'arrow':
      return <ArrowRightIcon />
    case 'chevron':
    default:
      return <ChevronRightIcon />
  }
}

export function Breadcrumb({ items, separator = 'chevron', onNavigate }: BreadcrumbProps) {
  const handleClick = (item: BreadcrumbItem, index: number, isLast: boolean) => {
    if (isLast || !item.href) return
    onNavigate?.(item, index)
  }

  return (
    <nav aria-label="Breadcrumb" data-testid="breadcrumb" className="breadcrumb">
      <ol className="breadcrumb-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={index} className="breadcrumb-item">
              {index > 0 && (
                <span className="breadcrumb-separator" aria-hidden="true">
                  <SeparatorIcon type={separator} />
                </span>
              )}
              {item.href && !isLast ? (
                <a
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault()
                    handleClick(item, index, isLast)
                  }}
                  className="breadcrumb-link"
                  data-testid="breadcrumb-link"
                >
                  {item.label}
                </a>
              ) : (
                <span
                  className="breadcrumb-current"
                  aria-current={isLast ? 'page' : undefined}
                  data-testid="breadcrumb-current"
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}