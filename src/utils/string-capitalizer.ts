function stringCapitalizer(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export default stringCapitalizer
export { stringCapitalizer }
