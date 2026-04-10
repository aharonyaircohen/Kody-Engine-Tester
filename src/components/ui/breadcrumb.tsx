'use client'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

function ChevronIcon() {
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
      data-testid="breadcrumb-separator-icon"
      className="breadcrumb-separator"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" data-testid="breadcrumb">
      <ol className="breadcrumb-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const isClickable = item.href && !isLast

          return (
            <li key={index} className="breadcrumb-item">
              {isClickable ? (
                <a href={item.href} className="breadcrumb-link">
                  {item.label}
                </a>
              ) : (
                <span className={isLast ? 'breadcrumb-active' : 'breadcrumb-text'}>
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronIcon />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}