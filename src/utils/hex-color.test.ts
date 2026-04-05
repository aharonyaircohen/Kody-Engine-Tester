import { describe, expect, it } from 'vitest'

import { hexToRgb, rgbToHex } from './hex-color'

describe('hexToRgb', () => {
  it('converts full hex to RGB', () => {
    expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 })
    expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 })
    expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 })
  })

  it('converts short hex to RGB', () => {
    expect(hexToRgb('#F00')).toEqual({ r: 255, g: 0, b: 0 })
    expect(hexToRgb('#0F0')).toEqual({ r: 0, g: 255, b: 0 })
    expect(hexToRgb('#00F')).toEqual({ r: 0, g: 0, b: 255 })
  })

  it('converts mixed colors', () => {
    expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 })
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
    expect(hexToRgb('#808080')).toEqual({ r: 128, g: 128, b: 128 })
    expect(hexToRgb('#FFA500')).toEqual({ r: 255, g: 165, b: 0 })
  })

  it('handles hex without hash', () => {
    expect(hexToRgb('FF0000')).toEqual({ r: 255, g: 0, b: 0 })
  })
})

describe('rgbToHex', () => {
  it('converts RGB to hex', () => {
    expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#ff0000')
    expect(rgbToHex({ r: 0, g: 255, b: 0 })).toBe('#00ff00')
    expect(rgbToHex({ r: 0, g: 0, b: 255 })).toBe('#0000ff')
  })

  it('converts white and black', () => {
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff')
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000')
  })

  it('pads single digit hex values', () => {
    expect(rgbToHex({ r: 10, g: 10, b: 10 })).toBe('#0a0a0a')
  })
})
