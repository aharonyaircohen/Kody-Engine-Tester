/**
 * Sanitizes user input by stripping HTML tags, trimming whitespace,
 * and normalizing unicode characters (NFD normalization + diacritic removal).
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''
  let s = input
  // Remove null bytes and strip HTML tags (including content inside script tags)
  s = s.replace(/\0/g, '')
  s = s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  s = s.replace(/<[^>]*>/g, '')
  // Normalize unicode (NFD) and strip diacritics (é → e, ñ → n, etc.)
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  // Trim leading and trailing whitespace
  return s.trim()
}
