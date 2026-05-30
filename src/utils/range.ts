export function range(end: number): number[]
export function range(start: number, end: number): number[]
export function range(start: number, end: number, step: number): number[]
export function range(a: number, b?: number, step?: number): number[] {
  let start: number
  let end: number
  let s: number
  if (b === undefined) {
    start = 0
    end = a
    s = 1
  } else {
    start = a
    end = b
    s = step ?? 1
  }
  if (s === 0) throw new Error('Step cannot be zero')
  if (s > 0 && start > end) throw new Error('Step direction wrong: positive step but start > end')
  if (s < 0 && start < end) throw new Error('Step direction wrong: negative step but start < end')
  const out: number[] = []
  if (s > 0) {
    for (let i = start; i < end; i += s) out.push(i)
  } else {
    for (let i = start; i > end; i += s) out.push(i)
  }
  return out
}
