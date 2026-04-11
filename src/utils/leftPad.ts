export function leftPad(str: string, targetLength: number, padChar: string): string {
  if (str.length >= targetLength) {
    return str
  }
  const padLength = targetLength - str.length
  const padding = padChar.repeat(padLength)
  return padding + str
}