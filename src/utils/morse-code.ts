const MORSE_CODE_MAP: Record<string, string> = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
  '0': '-----',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',
}

const REVERSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_CODE_MAP).map(([k, v]) => [v, k]),
)

export function textToMorse(text: string): string {
  const upperText = text.toUpperCase()
  const parts: string[] = []
  for (const char of upperText) {
    if (char === ' ') {
      parts.push(' ')
    } else if (MORSE_CODE_MAP[char]) {
      parts.push(MORSE_CODE_MAP[char])
    }
  }
  return parts.join(' ')
}

export function morseToText(morse: string): string {
  const codes = morse.split(' ')
  const parts: string[] = []
  for (const code of codes) {
    if (code === '') {
      continue
    }
    const char = REVERSE_MAP[code]
    if (char) {
      parts.push(char)
    }
  }
  return parts.join('')
}
