/**
 * Parses a minimal CSV string into a 2D array of trimmed fields.
 * Handles both LF (\\n) and CRLF (\\r\\n) line endings.
 * @param input - The CSV string to parse
 * @returns A 2D array of trimmed field strings
 */
export function parseCsv(input: string): string[][] {
  const rows = (input || '').replace(/\r\n/g, '\n').split('\n')
  // Discard trailing empty row from a trailing newline
  if (rows.length > 0 && rows[rows.length - 1] === '') {
    rows.pop()
  }
  return rows.map((row) => row.split(',').map((f) => f.trim()))
}
