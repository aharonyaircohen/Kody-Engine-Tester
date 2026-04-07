function base64urlDecode(data: string): string {
  const padded = data.padEnd(data.length + ((4 - (data.length % 4)) % 4), '=')
  return Buffer.from(padded, 'base64url').toString('utf-8')
}

export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return true
    }

    const payload = JSON.parse(base64urlDecode(parts[1]))
    const now = Math.floor(Date.now() / 1000)

    if (typeof payload.exp !== 'number') {
      return true
    }

    return payload.exp < now
  } catch {
    return true
  }
}