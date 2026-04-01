
### taskify (2026-04-01T23:21:21)
{
  "task_type": "feature",
  "title": "Add dark mode toggle button component",
  "description": "Add a DarkModeToggle React component in src/components/dark-mode-toggle.tsx that toggles between light and dark themes. The component should use a button with sun/moon icon, persist user preference to localStorage, and update the data-theme attribute on the HTML element. Include unit tests using @testing-library/react.",
  "scope": [
    "src/components/dark-mode-toggle.tsx",
    "src/components/dar
...(truncated)

### build (2026-04-01T23:35:35)
## Implementation Complete

I've implemented the `DarkModeToggle` component as requested:

### Files Created

**`src/components/dark-mode-toggle.tsx`**
- Toggle button with sun/moon SVG icons
- Persists preference to `localStorage` under key `theme-preference`
- Updates `data-theme` attribute on `document.documentElement`
- Reads system preference via `matchMedia` as fallback
- Optional `onToggle` callback prop

**`src/components/dark-mode-toggle.test.tsx`**
- 13 unit tests covering:
  - Initial
...(truncated)
