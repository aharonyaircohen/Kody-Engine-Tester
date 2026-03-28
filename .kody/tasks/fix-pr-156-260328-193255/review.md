Now all three reasons are visually distinct:
- `'both'`: red (`#fef2f2` / `#dc2626`)
- `'low-grade'`: amber (`#fffbeb` / `#d97706`)
- `'low-progress'`: blue (`#eff6ff` / `#2563eb`)

All review findings are now addressed:
- **Critical** (N+1 query + wrong filter): already fixed in build stage
- **Major** (duplicate fetch, hardcoded instructorId): already fixed in build stage
- **Minor** (`'use client'` directives): already removed (components have no client directive)
- **Minor** (indistinguishable reason badges): just fixed — three distinct color schemes
