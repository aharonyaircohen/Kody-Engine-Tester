export interface RGB {
  r: number
  g: number
  b: number
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
