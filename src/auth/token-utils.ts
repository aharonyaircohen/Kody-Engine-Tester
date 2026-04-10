function base64urlDecode(data: string): string {
  return Buffer.from(data, 'base64url').toString('utf-8')
}

interface TokenPayload {
  exp: number
  iat?: number
  [key: string]: unknown
}

export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return true
    }

    const payload: TokenPayload = JSON.parse(base64urlDecode(parts[1]))
    const now = Math.floor(Date.now() / 1000)

    if (typeof payload.exp !== 'number') {
      return true
    }

    return payload.exp < now
  } catch {
    return true
  }
}
