export function range(startOrEnd: number, end?: number, step?: number): number[] {
  let start: number
  let actualEnd: number

  if (end === undefined) {
    start = 0
    actualEnd = startOrEnd - 1
    if (startOrEnd <= 0) {
      return []
    }
  } else {
    start = startOrEnd
    actualEnd = end
  }

  const actualStep = step !== undefined ? step : start <= actualEnd ? 1 : -1

  if (actualStep === 0) {
    throw new Error('Step cannot be zero')
  }

  const result: number[] = []

  if (actualStep > 0) {
    for (let i = start; i <= actualEnd; i += actualStep) {
      result.push(i)
    }
  } else {
    for (let i = start; i >= actualEnd; i += actualStep) {
      result.push(i)
    }
  }

  return result
}
