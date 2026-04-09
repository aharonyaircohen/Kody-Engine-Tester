import { describe, it, expect } from 'vitest'
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb } from './colorConverter'

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

describe('rgbToHsl', () => {
  it('converts pure red', () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 })
  })

  it('converts pure green', () => {
    expect(rgbToHsl({ r: 0, g: 255, b: 0 })).toEqual({ h: 120, s: 100, l: 50 })
  })

  it('converts pure blue', () => {
    expect(rgbToHsl({ r: 0, g: 0, b: 255 })).toEqual({ h: 240, s: 100, l: 50 })
  })

  it('converts white and black', () => {
    expect(rgbToHsl({ r: 255, g: 255, b: 255 })).toEqual({ h: 0, s: 0, l: 100 })
    expect(rgbToHsl({ r: 0, g: 0, b: 0 })).toEqual({ h: 0, s: 0, l: 0 })
  })

  it('converts gray', () => {
    expect(rgbToHsl({ r: 128, g: 128, b: 128 })).toEqual({ h: 0, s: 0, l: 50 })
  })

  it('converts orange', () => {
    expect(rgbToHsl({ r: 255, g: 165, b: 0 })).toEqual({ h: 39, s: 100, l: 50 })
  })
})

describe('hslToRgb', () => {
  it('converts pure red', () => {
    expect(hslToRgb({ h: 0, s: 100, l: 50 })).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('converts pure green', () => {
    expect(hslToRgb({ h: 120, s: 100, l: 50 })).toEqual({ r: 0, g: 255, b: 0 })
  })

  it('converts pure blue', () => {
    expect(hslToRgb({ h: 240, s: 100, l: 50 })).toEqual({ r: 0, g: 0, b: 255 })
  })

  it('converts white and black', () => {
    expect(hslToRgb({ h: 0, s: 0, l: 100 })).toEqual({ r: 255, g: 255, b: 255 })
    expect(hslToRgb({ h: 0, s: 0, l: 0 })).toEqual({ r: 0, g: 0, b: 0 })
  })

  it('converts gray', () => {
    expect(hslToRgb({ h: 0, s: 0, l: 50 })).toEqual({ r: 128, g: 128, b: 128 })
  })
})