'use client'

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
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  if (!items.length) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" data-testid="breadcrumb">
      <ol className="breadcrumb-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const isLink = !isLast && item.href

          return (
            <li key={index} className="breadcrumb-item">
              {isLink ? (
                <a href={item.href} className="breadcrumb-link">
                  {item.label}
                </a>
              ) : (
                <span
                  className={isLast ? 'breadcrumb-active' : 'breadcrumb-text'}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span className="breadcrumb-separator" aria-hidden="true">
                  <ChevronRightIcon />
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}