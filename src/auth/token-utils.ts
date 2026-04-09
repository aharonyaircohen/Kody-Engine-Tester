import { TokenPayload } from './jwt-service'

function base64urlDecode(data: string): string {
  return Buffer.from(data, 'base64url').toString('utf-8')
}

/**
 * Checks if a JWT token is expired by decoding it (without signature verification)
 * and comparing the exp claim against the current time.
 *
 * @param token - A JWT token string
 * @returns true if the token is expired or invalid, false otherwise
 */
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