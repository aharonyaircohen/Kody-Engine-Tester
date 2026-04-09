
### taskify (2026-04-09T19:19:08)
Based on my exploration, I now have enough context to classify this task.

{
  "task_type": "feature",
  "title": "Add generic SearchBar component",
  "description": "Create a reusable SearchBar component at src/components/SearchBar.tsx following existing patterns from contacts/SearchBar and notes/SearchBar. Should include debounce support similar to contacts/SearchBar, use CSS modules for styling, and follow the 'use client' directive pattern.",
  "scope": ["src/components/SearchBar.tsx", "src/
...(truncated)

### build (2026-04-09T19:21:50)
I have created the generic SearchBar component at `src/components/SearchBar.tsx` and `src/components/SearchBar.module.css`. 

**Summary of changes:**

1. **`src/components/SearchBar.tsx`** - Reusable SearchBar component with:
   - `'use client'` directive
   - Debounce support (following contacts/SearchBar pattern via `useMemo` + `useEffect`)
   - Props: `value`, `onChange`, `placeholder` (default: "Search..."), `debounceMs` (default: 300)
   - Imports debounce from `../utils/debounce`

2. **`sr
...(truncated)
