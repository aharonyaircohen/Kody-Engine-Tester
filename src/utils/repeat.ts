export function repeat(str: string, times: number): string {
  if (times < 0) {
    throw new Error('Times must be a non-negative number')
  }
  return str.repeat(times)
}