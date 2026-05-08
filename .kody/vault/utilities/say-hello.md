---
title: sayHello Utility
type: component
updated: 2026-05-08
sources:
  - https://github.com/aharonyaircohen/Kody-Engine-Tester/pull/3220
---

`sayHello` is a minimal string-interpolation greet utility in `src/utils/say-hello.ts`.

## Signature

```typescript
export function sayHello(name: string): string
```

Returns `"Hello, ${name}!"`. Tested via `src/utils/say-hello.test.ts` (Vitest).

## See also

- [../architecture/nightly-tests](../architecture/nightly-tests.md) — uses `sayHello` output in PR body assertions (`prBodyContains: ["greet"]`)
- [./say-goodbye.md](./say-goodbye.md) — composes `sayHello`
- [./say-both.md](./say-both.md) — composes both `sayHello` and `sayGoodbye`
