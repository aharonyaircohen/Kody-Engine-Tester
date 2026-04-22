/**
 * Parses a minimal CSV string into a 2D array of trimmed fields.
 * Splits on LF (\\n); CRLF (\\r\\n) is accepted but \\r characters on
 * trailing fields are trimmed away by the field-level trim() call.
 * @param input - The CSV string to parse
 * @returns A 2D array of trimmed field strings
 */
export function parseCsv(input: string): string[][] {
  const rows = (input || '').split('\n')
  // Discard trailing empty row from a trailing newline
  if (rows.length > 0 && rows[rows.length - 1] === '') {
    rows.pop()
  }
  return rows.map((row) => row.split(',').map((f) => f.trim()))
}
