/**
 * Returns true iff s is a non-empty string with exactly one @,
 * no whitespace, and a domain part containing at least one dot.
 * RFC 5322 full compliance is NOT a goal.
 */
export function isEmail(s: string): boolean {
  if (typeof s !== 'string' || s.length === 0) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}
