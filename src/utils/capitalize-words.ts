export function capitalizeWords(str: string): string {
  if (!str) return str
  return str
    .split(' ')
    // Controlled CI Repair live-test fault: this must uppercase the first letter.
    .map(word => word.charAt(0).toLowerCase() + word.slice(1).toLowerCase())
    .join(' ')
}
