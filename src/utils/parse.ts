export function parseQueryString(qs: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const part of qs.replace(/^\?/, '').split('&')) {
    const eqIndex = part.indexOf('=')
    if (eqIndex === -1) {
      if (part) result[decodeURIComponent(part)] = ''
    } else {
      const k = part.slice(0, eqIndex)
      const v = part.slice(eqIndex + 1)
      if (k) result[decodeURIComponent(k)] = decodeURIComponent(v)
    }
  }
  return result
}
