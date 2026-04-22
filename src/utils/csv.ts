export function parseCsv(input: string): string[][] {
  const rows = (input || '').split('\n')
  // Discard trailing empty row from a trailing newline
  if (rows.length > 0 && rows[rows.length - 1] === '') {
    rows.pop()
  }
  return rows.map((row) => row.split(',').map((f) => f.trim()))
}
