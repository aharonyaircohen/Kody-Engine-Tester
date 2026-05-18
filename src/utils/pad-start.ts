export function padStart(str: string, targetLength: number, padChar: string): string {
  if (str.length >= targetLength) {
    return str
  }
  const padLength = targetLength - str.length
  const padding = padChar.repeat(Math.ceil(padLength / padChar.length)).slice(0, padLength)
  return padding + str
}
