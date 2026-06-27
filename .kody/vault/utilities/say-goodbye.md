---
title: sayGoodbye Utility
type: component
updated: 2026-05-08
sources:
  - https://github.com/aharonyaircohen/Kody-Engine-Tester/pull/3227
---

`sayGoodbye` is a string-interpolation utility in `src/utils/say-goodbye.ts` that composes the [`sayHello`](./say-hello.md) utility.

## Signature

```typescript
export function sayGoodbye(name: string): string
```

Returns `` `${sayHello(name)} Goodbye, ${name}!` `` — e.g. `sayGoodbye('World')` → `"Hello, World! Goodbye, World!"`. Tested via `src/utils/say-goodbye.test.ts` (Vitest).

## Design notes

- `sayGoodbye` intentionally imports `sayHello` from `./say-hello` to demonstrate cross-file composition
- Both utilities live under `src/utils/`

## See also

- [./say-hello.md](./say-hello.md) — the utility it composes
- [./say-both.md](./say-both.md) — composes both `sayHello` and `sayGoodbye`
