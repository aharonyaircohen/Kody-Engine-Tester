export function pipe(): <T>(value: T) => T
export function pipe<A>(value: A): A
export function pipe<A, B>(fn1: (a: A) => B): (value: A) => B
export function pipe<A, B, C>(fn1: (a: A) => B, fn2: (b: B) => C): (value: A) => C
export function pipe<A, B, C, D>(fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D): (value: A) => D
export function pipe<A, B, C, D, E>(fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E): (value: A) => E
export function pipe<A, B, C, D, E, F>(fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E, fn5: (e: E) => F): (value: A) => F
export function pipe<A, B, C, D, E, F, G>(fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G): (value: A) => G
export function pipe<A, B, C, D, E, F, G, H>(fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G, fn7: (g: G) => H): (value: A) => H
export function pipe<A, B, C, D, E, F, G, H, I>(fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G, fn7: (g: G) => H, fn8: (h: H) => I): (value: A) => I
export function pipe<A, B, C, D, E, F, G, H, I, J>(fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G, fn7: (g: G) => H, fn8: (h: H) => I, fn9: (i: I) => J): (value: A) => J
export function pipe<A, B, C, D, E, F, G, H, I, J, K>(fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G, fn7: (g: G) => H, fn8: (h: H) => I, fn9: (i: I) => J, fn10: (j: J) => K): (value: A) => K
export function pipe(...fns: Array<(x: unknown) => unknown>): unknown {
  if (fns.length === 0) return (value: unknown) => value
  return (value: unknown) => fns.reduce((acc, fn) => fn(acc), value)
}
