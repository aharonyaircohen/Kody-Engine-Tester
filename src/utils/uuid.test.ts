import { describe, it, expect } from 'vitest'
import { uuidv4 } from './uuid'

// UUID v4 regex: 8-4-4-4-12 hex digits, version 4 (first char of 3rd segment = 4), variant 10 (first char of 4th segment ∈ {8, 9, a, b})
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

describe('uuidv4', () => {
  it('generates a valid UUID v4 format', () => {
    const uuid = uuidv4()
    expect(uuid).toMatch(UUID_V4_REGEX)
  })

  it('generates a string of correct length (36 characters)', () => {
    const uuid = uuidv4()
    expect(uuid).toHaveLength(36)
  })

  it('contains exactly 5 hyphen-separated segments with correct lengths', () => {
    const uuid = uuidv4()
    const segments = uuid.split('-')
    expect(segments).toHaveLength(5)
    expect(segments[0]).toHaveLength(8)
    expect(segments[1]).toHaveLength(4)
    expect(segments[2]).toHaveLength(4)
    expect(segments[3]).toHaveLength(4)
    expect(segments[4]).toHaveLength(12)
  })

  it('sets version 4 bits correctly (3rd segment starts with 4)', () => {
    const uuid = uuidv4()
    const thirdSegment = uuid.split('-')[2]
    expect(thirdSegment[0]).toBe('4')
  })

  it('sets variant bits correctly (4th segment starts with 8, 9, a, or b)', () => {
    const uuid = uuidv4()
    const fourthSegment = uuid.split('-')[3]
    const firstChar = fourthSegment[0].toLowerCase()
    expect(['8', '9', 'a', 'b']).toContain(firstChar)
  })

  it('generates unique values across multiple calls', () => {
    const uuids = new Set<string>()
    const count = 1000
    for (let i = 0; i < count; i++) {
      uuids.add(uuidv4())
    }
    // All generated UUIDs should be unique
    expect(uuids.size).toBe(count)
  })

  it('generates only lowercase hex characters', () => {
    const uuid = uuidv4()
    const hexOnly = uuid.replace(/-/g, '')
    expect(hexOnly).toMatch(/^[0-9a-f]+$/)
  })

  it('generates different UUIDs on successive calls', () => {
    const uuid1 = uuidv4()
    const uuid2 = uuidv4()
    expect(uuid1).not.toBe(uuid2)
  })

  it('handles multiple rapid generations without collision', () => {
    const uuids = Array.from({ length: 100 }, () => uuidv4())
    const uniqueUuids = new Set(uuids)
    expect(uniqueUuids.size).toBe(100)
  })

  it('returns a string type', () => {
    const uuid = uuidv4()
    expect(typeof uuid).toBe('string')
  })
})
