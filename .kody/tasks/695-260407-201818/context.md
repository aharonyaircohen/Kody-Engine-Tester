
### taskify (2026-04-07T20:21:20)
{
  "task_type": "feature",
  "title": "Add Breadcrumb component",
  "description": "Create a Breadcrumb React component at src/components/ui/breadcrumb.tsx that renders a trail of links. Props: items: { label: string; href?: string }[]. Active item (last) renders as plain text, other items render as Next.js Links. Include co-located unit test at src/components/ui/breadcrumb.test.tsx.",
  "scope": [
    "src/components/ui/breadcrumb.tsx",
    "src/components/ui/breadcrumb.test.tsx",
    "src/com
...(truncated)

### build (2026-04-07T20:25:04)
Done. I created the Breadcrumb component with the following files:

**Created files:**
- `src/components/ui/breadcrumb.tsx` - React component with `BreadcrumbItem[]` prop
- `src/components/ui/breadcrumb.module.css` - Styles with separator, link, and active states
- `src/components/ui/breadcrumb.test.tsx` - 6 unit tests covering all functionality

**Implementation details:**
- Props: `items: { label: string; href?: string }[]`
- Last item renders as plain `<span>` (active)
- Non-last items with h
...(truncated)
