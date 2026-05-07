export function parseQueryString(qs: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const part of qs.replace(/^\?/, '').split('&')) {
    const [k, v = ''] = part.split('=')
    if (k) result[decodeURIComponent(k)] = decodeURIComponent(v)
  }
  return result
}
