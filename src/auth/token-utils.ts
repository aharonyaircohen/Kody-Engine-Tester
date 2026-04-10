function base64urlDecode(data: string): string {
  return Buffer.from(data, 'base64url').toString('utf-8')
}

export function isTokenExpired(token: string): boolean {
  const parts = token.split('.')
  if (parts.length !== 3) {
    return true
  }

  try {
    const payload = JSON.parse(base64urlDecode(parts[1])) as { exp?: number }
    if (typeof payload.exp !== 'number') {
      return true
    }

    const now = Math.floor(Date.now() / 1000)
    return payload.exp < now
  } catch {
    return true
  }
}