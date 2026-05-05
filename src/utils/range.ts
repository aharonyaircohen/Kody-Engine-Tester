export function range(start: number, end: number, step = 1): number[] {
  const out: number[] = []
  for (let i = start; i < end; i += step) out.push(i)
  return out
}
