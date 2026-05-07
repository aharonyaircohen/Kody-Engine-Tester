const RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export function isValidEmail(s: string): boolean { return RE.test(s) }
