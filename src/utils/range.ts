export function range(startOrEnd: number, end?: number, step = 1): number[] {
  let start: number

  if (end === undefined) {
    start = 0
    end = startOrEnd
  } else {
    start = startOrEnd
  }

  if (step === 0) {
    throw new Error('Step cannot be zero')
  }

  if (step > 0 && start > end) {
    throw new Error('Step must be negative when start is greater than end')
  }

  if (step < 0 && start < end) {
    throw new Error('Step must be positive when start is less than end')
  }

  const result: number[] = []

  if (step > 0) {
    for (let i = start; i < end; i += step) {
      result.push(i)
    }
  } else {
    for (let i = start; i > end; i += step) {
      result.push(i)
    }
  }

  return result
}
