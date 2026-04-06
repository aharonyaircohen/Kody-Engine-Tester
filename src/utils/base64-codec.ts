import { Transform, type TransformCallback, type TransformOptions } from 'stream'

/**
 * Options for Base64 encoding/decoding streams.
 */
export interface Base64CodecOptions extends TransformOptions {
  /**
   * The chunk size to process at a time. Default is 1024 bytes.
   */
  chunkSize?: number
}

/**
 * A Transform stream that encodes binary data to base64.
 * Handles remainder bytes between chunks to ensure correct base64 grouping.
 */
export class Base64EncodeStream extends Transform {
  private readonly chunkSize: number
  private remainder: Buffer = Buffer.alloc(0)

  constructor(options: Base64CodecOptions = {}) {
    super({ ...options })
    this.chunkSize = options.chunkSize ?? 1024
  }

  /**
   * @param chunk - The binary chunk to encode
   * @param encoding - The encoding of the chunk (ignored, we work with buffers)
   * @param callback - Called when the chunk has been processed
   */
  _transform(chunk: Buffer, _encoding: BufferEncoding, callback: TransformCallback): void {
    try {
      // Combine previous remainder with current chunk
      const combined = Buffer.concat([this.remainder, chunk])
      const length = combined.length

      // Calculate how many complete groups of 3 bytes we can process
      const completeGroups = Math.floor(length / 3)
      const bytesUsed = completeGroups * 3
      const newRemainder = combined.subarray(bytesUsed)

      if (completeGroups > 0) {
        const toEncode = combined.subarray(0, bytesUsed)
        const encoded = toEncode.toString('base64')
        this.push(encoded)
      }

      this.remainder = newRemainder
      callback()
    } catch (error) {
      callback(error instanceof Error ? error : new Error(String(error)))
    }
  }

  _flush(callback: TransformCallback): void {
    try {
      // Encode any remaining bytes
      if (this.remainder.length > 0) {
        const encoded = this.remainder.toString('base64')
        this.push(encoded)
      }
      callback()
    } catch (error) {
      callback(error instanceof Error ? error : new Error(String(error)))
    }
  }
}

/**
 * A Transform stream that decodes base64 data to binary.
 * Accumulates characters and decodes complete groups of 4.
 */
export class Base64DecodeStream extends Transform {
  private buffer: string = ''

  constructor(options: Base64CodecOptions = {}) {
    super({ ...options })
  }

  /**
   * @param chunk - The base64 encoded chunk to decode
   * @param encoding - The encoding of the chunk (ignored, we work with strings)
   * @param callback - Called when the chunk has been processed
   */
  _transform(chunk: Buffer, _encoding: BufferEncoding, callback: TransformCallback): void {
    try {
      const chunkStr = chunk.toString('utf-8')
      this.buffer += chunkStr

      // Calculate how many complete groups of 4 characters we can decode
      const length = this.buffer.length
      const completeGroups = Math.floor(length / 4)

      if (completeGroups > 0) {
        const toDecode = this.buffer.substring(0, completeGroups * 4)
        const remainder = this.buffer.substring(completeGroups * 4)

        const decoded = Buffer.from(toDecode, 'base64')
        this.push(decoded)
        this.buffer = remainder
      }

      callback()
    } catch (error) {
      callback(error instanceof Error ? error : new Error(String(error)))
    }
  }

  _flush(callback: TransformCallback): void {
    try {
      // Decode any remaining characters in the buffer
      if (this.buffer.length > 0) {
        const decoded = Buffer.from(this.buffer, 'base64')
        this.push(decoded)
      }
      this.buffer = ''
      callback()
    } catch (error) {
      callback(error instanceof Error ? error : new Error(String(error)))
    }
  }
}

/**
 * Encodes a buffer to base64 using a streaming approach.
 * @param input - The buffer to encode
 * @param options - Codec options including chunk size
 * @returns A promise that resolves to the base64 encoded string
 */
export async function encode(input: Buffer, options?: Base64CodecOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = new Base64EncodeStream(options)
    const chunks: Buffer[] = []

    stream.on('data', (chunk: Buffer) => chunks.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
    stream.on('error', reject)

    stream.end(input)
  })
}

/**
 * Decodes a base64 string to a buffer using a streaming approach.
 * @param input - The base64 string to decode
 * @param options - Codec options including chunk size
 * @returns A promise that resolves to the decoded buffer
 */
export async function decode(input: string, options?: Base64CodecOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const stream = new Base64DecodeStream(options)
    const chunks: Buffer[] = []

    stream.on('data', (chunk: Buffer) => chunks.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(chunks)))
    stream.on('error', reject)

    stream.end(Buffer.from(input, 'utf-8'))
  })
}

/**
 * Checks if a string is valid base64.
 * @param input - The string to validate
 * @returns True if the string appears to be valid base64
 */
export function isValid(input: string): boolean {
  if (!input || input.length === 0) {
    return false
  }
  // Base64 strings should only contain valid characters
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
  if (!base64Regex.test(input)) {
    return false
  }
  // Check length is a multiple of 4
  if (input.length % 4 !== 0) {
    return false
  }
  return true
}
