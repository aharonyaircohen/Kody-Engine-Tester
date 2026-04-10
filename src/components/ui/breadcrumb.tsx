'use client'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" data-testid="breadcrumb">
      <ol className="breadcrumb-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={index} className="breadcrumb-item">
              {isLast ? (
                <span aria-current="page">{item.label}</span>
              ) : (
                <a href={item.href}>{item.label}</a>
              )}
              {!isLast && <span className="breadcrumb-separator" aria-hidden="true">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}