import crypto from 'crypto'

/**
 * Generates an RSA key pair for testing purposes.
 * Uses require to bypass ES module mocking in vitest.
 */
export function generateTestKeyPair(): { privateKey: string; publicKey: string } {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const cryptoModule = require('crypto')
  const { privateKey, publicKey } = cryptoModule.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  })
  return { privateKey, publicKey }
}

/**
 * Computes PBKDF2 hash for test data.
 * Uses require to bypass ES module mocking in vitest.
 */
export async function computeTestPasswordHash(password: string, salt: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const cryptoModule = require('crypto')
  return new Promise((resolve, reject) => {
    cryptoModule.pbkdf2(password, salt, 25000, 512, 'sha256', (err: Error | null, derivedKey?: Buffer) => {
      if (err) {
        reject(err)
        return
      }
      resolve(derivedKey!.toString('hex'))
    })
  })
}