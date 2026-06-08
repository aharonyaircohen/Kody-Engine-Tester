export interface CartItem {
  sku: string
  name: string
  quantity: number
  unitPriceCents: number
}

export interface Coupon {
  code: string
  percentOff: number
}

export interface LineItem {
  sku: string
  name: string
  quantity: number
  unitPriceCents: number
  lineTotalCents: number
}

export interface CheckoutSummary {
  lineItems: LineItem[]
  subtotalCents: number
  discountCents: number
  taxCents: number
  totalCents: number
  appliedCouponCode?: string
  warnings: string[]
}

function isValidCartItem(item: CartItem): boolean {
  if (!item.sku || item.sku.trim() === '') return false
  if (!item.name || item.name.trim() === '') return false
  if (item.quantity <= 0) return false
  if (item.unitPriceCents < 0) return false
  return true
}

export function buildCheckoutSummary(
  items: CartItem[],
  coupon?: Coupon,
  taxRate?: number,
): CheckoutSummary {
  const warnings: string[] = []
  const lineItems: LineItem[] = []

  let subtotalCents = 0

  for (const item of items) {
    if (!isValidCartItem(item)) {
      warnings.push(
        `Invalid row ignored: sku="${item.sku}", name="${item.name}", quantity=${item.quantity}, unitPriceCents=${item.unitPriceCents}`,
      )
      continue
    }

    const lineTotalCents = item.quantity * item.unitPriceCents
    subtotalCents += lineTotalCents

    lineItems.push({
      sku: item.sku,
      name: item.name,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      lineTotalCents,
    })
  }

  let discountCents = 0
  let appliedCouponCode: string | undefined

  if (coupon) {
    if (coupon.percentOff <= 0 || coupon.percentOff > 100) {
      warnings.push(
        `Invalid coupon ignored: code="${coupon.code}", percentOff=${coupon.percentOff}`,
      )
    } else {
      appliedCouponCode = coupon.code
      discountCents = Math.round((subtotalCents * coupon.percentOff) / 100)
    }
  }

  let effectiveTaxRate = 0
  if (taxRate !== undefined) {
    if (taxRate < 0 || taxRate > 1) {
      warnings.push(`Invalid tax rate ignored: ${taxRate}`)
      effectiveTaxRate = 0
    } else {
      effectiveTaxRate = taxRate
    }
  }

  const taxableCents = subtotalCents - discountCents
  const taxCents = Math.round(taxableCents * effectiveTaxRate)
  const totalCents = taxableCents + taxCents

  return {
    lineItems,
    subtotalCents,
    discountCents,
    taxCents,
    totalCents,
    ...(appliedCouponCode !== undefined && { appliedCouponCode }),
    warnings,
  }
}
