export interface RGB {
  r: number
  g: number
  b: number
}

export interface HSL {
  h: number
  s: number
  l: number
}

export function hexToRgb(hex: string): RGB {
  const cleanHex = hex.replace('#', '')
  const isShort = cleanHex.length === 3

  const r = isShort
    ? parseInt(cleanHex[0] + cleanHex[0], 16)
    : parseInt(cleanHex.substring(0, 2), 16)
  const g = isShort
    ? parseInt(cleanHex[1] + cleanHex[1], 16)
    : parseInt(cleanHex.substring(2, 4), 16)
  const b = isShort
    ? parseInt(cleanHex[2] + cleanHex[2], 16)
    : parseInt(cleanHex.substring(4, 6), 16)

  return { r, g, b }
}

export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0')
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
}

export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) }
  }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

  let h = 0
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6
      break
    case g:
      h = ((b - r) / d + 2) / 6
      break
    case b:
      h = ((r - g) / d + 4) / 6
      break
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360
  const s = hsl.s / 100
  const l = hsl.l / 100

  if (s === 0) {
    const gray = Math.round(l * 255)
    return { r: gray, g: gray, b: gray }
  }

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255)
  }
}

export function lighten(color: string | RGB, amount: number): string {
  const rgb = typeof color === 'string' ? hexToRgb(color) : color
  const hsl = rgbToHsl(rgb)
  const newL = Math.min(100, hsl.l + amount)
  const newRgb = hslToRgb({ ...hsl, l: newL })
  return rgbToHex(newRgb)
}

export function darken(color: string | RGB, amount: number): string {
  const rgb = typeof color === 'string' ? hexToRgb(color) : color
  const hsl = rgbToHsl(rgb)
  const newL = Math.max(0, hsl.l - amount)
  const newRgb = hslToRgb({ ...hsl, l: newL })
  return rgbToHex(newRgb)
}
