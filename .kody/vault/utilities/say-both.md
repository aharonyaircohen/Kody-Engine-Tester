---
title: sayBoth Utility
type: component
updated: 2026-05-08
sources:
  - https://github.com/aharonyaircohen/Kody-Engine-Tester/pull/3235
---

`sayBoth` is a string-interpolation utility in `src/utils/say-both.ts` that composes the [`sayHello`](./say-hello.md) and [`sayGoodbye`](./say-goodbye.md) utilities.

## Signature

```typescript
export function sayBoth(name: string): string
```

Returns `` `${sayHello(name)} And finally: ${sayGoodbye(name)}` `` — e.g. `sayBoth('World')` → `"Hello, World! And finally: Hello, World! Goodbye, World!"`. Tested via `src/utils/say-both.test.ts` (Vitest).

## Design notes

- `sayBoth` intentionally imports both `sayHello` and `sayGoodbye` to demonstrate layered composition
- All three utilities live under `src/utils/`

## See also

- [./say-hello.md](./say-hello.md) — base greet utility
- [./say-goodbye.md](./say-goodbye.md) — greet + farewell utility
