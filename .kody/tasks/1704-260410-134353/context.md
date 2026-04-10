
### taskify (2026-04-10T13:46:32)
{
  "task_type": "feature",
  "title": "Add breadcrumb component",
  "description": "Create a Breadcrumb React component in src/components/ui/breadcrumb.tsx that renders a trail of links. Props: items: { label: string; href?: string }[]. Active item (last) is plain text, others are links. Include unit test following existing component patterns.",
  "scope": [
    "src/components/ui/breadcrumb.tsx",
    "src/components/ui/breadcrumb.module.css",
    "src/components/ui/breadcrumb.test.tsx"
  ],
  
...(truncated)

### build (2026-04-10T13:50:05)
## Summary

I've implemented the Breadcrumb component following the existing PriorityBadge patterns:

**Created files:**

1. **`src/components/ui/breadcrumb.tsx`** - React component with:
   - `'use client'` directive
   - Props interface: `items: { label: string; href?: string }[]`
   - Active item (last) rendered as `<span>`, others as `<a>` links
   - Separator `/` between items

2. **`src/components/ui/breadcrumb.module.css`** - CSS module with:
   - `.breadcrumb`, `.list`, `.item`, `.link`,
...(truncated)
