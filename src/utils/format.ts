export function formatCurrency(amount: number, currency = "USD"): string {
  return `${currency} ${amount.toFixed(2)}`
}
