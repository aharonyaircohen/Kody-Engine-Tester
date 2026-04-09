export interface TokenPayload {
  userId: string
  email: string
  role: string
  sessionId: string
  generation: number
  iat: number
  exp: number
}

function base64urlDecode(data: string): string {
  return Buffer.from(data, 'base64url').toString('utf-8')
}

export function isTokenExpired(token: string): boolean {
  const parts = token.split('.')
  if (parts.length !== 3) {
    return true
  }

  const payload: TokenPayload = JSON.parse(base64urlDecode(parts[1]))
  const now = Math.floor(Date.now() / 1000)

  return payload.exp < now
}