function base64urlDecode(data: string): string {
  return Buffer.from(data, 'base64url').toString('utf-8')
}

export interface DecodedToken {
  exp: number
  iat: number
  [key: string]: unknown
}

export function isTokenExpired(token: string): boolean {
  const parts = token.split('.')
  if (parts.length !== 3) {
    return true
  }

  try {
    const payload: DecodedToken = JSON.parse(base64urlDecode(parts[1]))
    const now = Math.floor(Date.now() / 1000)
    return payload.exp < now
  } catch {
    return true
  }
}