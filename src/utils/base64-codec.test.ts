import { describe, it, expect } from 'vitest'
import { encode, decode, isValid, Base64EncodeStream, Base64DecodeStream } from './base64-codec'
import { Readable } from 'stream'

describe('base64-codec', () => {
  describe('encode', () => {
    it('should encode a simple string to base64', async () => {
      const input = Buffer.from('Hello, World!')
      const result = await encode(input)
      expect(result).toBe(Buffer.from('Hello, World!').toString('base64'))
    })

    it('should encode unicode characters correctly', async () => {
      const input = Buffer.from('こんにちは世界')
      const result = await encode(input)
      expect(result).toBe(Buffer.from('こんにちは世界').toString('base64'))
    })

    it('should encode an empty buffer', async () => {
      const input = Buffer.from('')
      const result = await encode(input)
      expect(result).toBe('')
    })

    it('should encode binary data correctly', async () => {
      const input = Buffer.from([0x00, 0xff, 0x10, 0x20])
      const result = await encode(input)
      expect(result).toBe(Buffer.from([0x00, 0xff, 0x10, 0x20]).toString('base64'))
    })

    it('should encode large data', async () => {
      const input = Buffer.alloc(10000, 0x41) // 10000 'A' characters
      const result = await encode(input)
      expect(result).toBe(Buffer.alloc(10000, 0x41).toString('base64'))
    })
  })

  describe('decode', () => {
    it('should decode a simple base64 string', async () => {
      const encoded = Buffer.from('SGVsbG8sIFdvcmxkIQ==').toString('utf-8')
      const result = await decode(encoded)
      expect(result.toString('utf-8')).toBe('Hello, World!')
    })

    it('should decode unicode characters', async () => {
      const original = 'こんにちは世界'
      const encoded = Buffer.from(original).toString('base64')
      const result = await decode(encoded)
      expect(result.toString('utf-8')).toBe(original)
    })

    it('should decode an empty string', async () => {
      const result = await decode('')
      expect(result.length).toBe(0)
    })

    it('should decode binary data correctly', async () => {
      const original = Buffer.from([0x00, 0xff, 0x10, 0x20])
      const encoded = original.toString('base64')
      const result = await decode(encoded)
      expect(result).toEqual(original)
    })

    it('should handle padding correctly', async () => {
      // "abc" encodes to "YWJj" (no padding needed)
      const result = await decode('YWJj')
      expect(result.toString('utf-8')).toBe('abc')

      // "ab" encodes to "YWI=" (1 padding char)
      const result2 = await decode('YWI=')
      expect(result2.toString('utf-8')).toBe('ab')

      // "a" encodes to "YQ==" (2 padding chars)
      const result3 = await decode('YQ==')
      expect(result3.toString('utf-8')).toBe('a')
    })
  })

  describe('isValid', () => {
    it('should return true for valid base64', () => {
      expect(isValid('SGVsbG8sIFdvcmxkIQ==')).toBe(true)
      expect(isValid('YWJjZGVm')).toBe(true)
      expect(isValid('YWJjZGVmZ2hpamtsbW5vcHFyc3R2d3h5ejEyMzQ1Njc4OTA=')).toBe(true)
    })

    it('should return false for empty string', () => {
      expect(isValid('')).toBe(false)
    })

    it('should return false for invalid base64 characters', () => {
      expect(isValid('SGVsbG8!')).toBe(false)
      expect(isValid('abc def')).toBe(false)
    })

    it('should return false for wrong length (not multiple of 4)', () => {
      expect(isValid('YWJjY')).toBe(false)
      expect(isValid('YWJjYWR')).toBe(false)
    })

    it('should return false for null/undefined', () => {
      expect(isValid(null as unknown as string)).toBe(false)
      expect(isValid(undefined as unknown as string)).toBe(false)
    })
  })

  describe('Base64EncodeStream', () => {
    it('should encode data streamed through it', async () => {
      const stream = new Base64EncodeStream()
      const chunks: Buffer[] = []

      stream.on('data', (chunk: Buffer) => chunks.push(chunk))
      stream.on('end', () => {
        const result = Buffer.concat(chunks).toString('utf-8')
        expect(result).toBe(Buffer.from('test').toString('base64'))
      })

      stream.write(Buffer.from('te'))
      stream.write(Buffer.from('st'))
      stream.end()
    })

    it('should handle empty chunks', async () => {
      const stream = new Base64EncodeStream()
      const chunks: Buffer[] = []

      stream.on('data', (chunk: Buffer) => chunks.push(chunk))
      stream.on('end', () => {
        const result = Buffer.concat(chunks).toString('utf-8')
        expect(result).toBe(Buffer.from('test').toString('base64'))
      })

      stream.write(Buffer.from(''))
      stream.write(Buffer.from('test'))
      stream.write(Buffer.from(''))
      stream.end()
    })

    it('should encode in chunks across multiple writes', async () => {
      const stream = new Base64EncodeStream()
      const chunks: Buffer[] = []

      stream.on('data', (chunk: Buffer) => chunks.push(chunk))

      await new Promise<void>((resolve) => {
        stream.on('end', resolve)
        stream.write(Buffer.from('Hello, '))
        stream.write(Buffer.from('World!'))
        stream.end()
      })

      const result = Buffer.concat(chunks).toString('utf-8')
      expect(result).toBe(Buffer.from('Hello, World!').toString('base64'))
    })
  })

  describe('Base64DecodeStream', () => {
    it('should decode data streamed through it', async () => {
      const stream = new Base64DecodeStream()
      const chunks: Buffer[] = []
      const encoded = Buffer.from('test').toString('base64') // 'dGVzdA=='

      stream.on('data', (chunk: Buffer) => chunks.push(chunk))
      stream.on('end', () => {
        const result = Buffer.concat(chunks).toString('utf-8')
        expect(result).toBe('test')
      })

      // Write in two parts to test chunking
      stream.write(Buffer.from('dGV'))
      stream.write(Buffer.from('zdA=='))
      stream.end()
    })

    it('should handle empty chunks', async () => {
      const stream = new Base64DecodeStream()
      const chunks: Buffer[] = []
      const encoded = Buffer.from('test').toString('base64')

      stream.on('data', (chunk: Buffer) => chunks.push(chunk))
      stream.on('end', () => {
        const result = Buffer.concat(chunks).toString('utf-8')
        expect(result).toBe('test')
      })

      stream.write(Buffer.from(''))
      stream.write(Buffer.from(encoded))
      stream.write(Buffer.from(''))
      stream.end()
    })

    it('should decode in chunks across multiple writes', async () => {
      const stream = new Base64DecodeStream()
      const chunks: Buffer[] = []
      const original = 'Hello, World!'
      const encoded = Buffer.from(original).toString('base64')

      stream.on('data', (chunk: Buffer) => chunks.push(chunk))

      await new Promise<void>((resolve) => {
        stream.on('end', resolve)
        // Write 4 chars at a time (complete base64 group)
        for (let i = 0; i < encoded.length; i += 4) {
          stream.write(Buffer.from(encoded.substring(i, i + 4)))
        }
        stream.end()
      })

      const result = Buffer.concat(chunks).toString('utf-8')
      expect(result).toBe(original)
    })
  })

  describe('streaming large data', () => {
    it('should handle large buffers', async () => {
      const largeData = Buffer.alloc(100000, 0x55) // 100KB of 'U'
      const result = await encode(largeData)
      expect(result).toBe(largeData.toString('base64'))
    })

    it('should decode large base64 strings', async () => {
      const largeData = Buffer.alloc(100000, 0x56) // 100KB of 'V'
      const encoded = largeData.toString('base64')
      const result = await decode(encoded)
      expect(result).toEqual(largeData)
    })
  })

  describe('pipeline integration', () => {
    it('should work in a pipeline with Readable', async () => {
      const readable = Readable.from([Buffer.from('Hello'), Buffer.from(', '), Buffer.from('World!')])
      const stream = new Base64EncodeStream()
      const chunks: Buffer[] = []

      stream.on('data', (chunk: Buffer) => chunks.push(chunk))

      await new Promise<void>((resolve, reject) => {
        readable.pipe(stream)
        stream.on('end', resolve)
        stream.on('error', reject)
      })

      const result = Buffer.concat(chunks).toString('utf-8')
      expect(result).toBe(Buffer.from('Hello, World!').toString('base64'))
    })
  })
})
