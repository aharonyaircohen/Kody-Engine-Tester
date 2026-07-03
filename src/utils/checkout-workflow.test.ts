import { describe, expect, it } from 'vitest'

import { buildCheckoutSummary, type CartItem } from './checkout-workflow'

describe('buildCheckoutSummary', () => {
  it('returns zero totals for empty cart', () => {
    const result = buildCheckoutSummary([])
    expect(result.lineItems).toEqual([])
    expect(result.subtotalCents).toBe(0)
    expect(result.discountCents).toBe(0)
    expect(result.taxCents).toBe(0)
    expect(result.totalCents).toBe(0)
    expect(result.appliedCouponCode).toBeUndefined()
    expect(result.warnings).toEqual([])
  })

  it('handles normal multi-item checkout', () => {
    const items: CartItem[] = [
      { sku: 'A1', name: 'Widget', quantity: 2, unitPriceCents: 1000 },
      { sku: 'B2', name: 'Gadget', quantity: 3, unitPriceCents: 500 },
    ]
    const result = buildCheckoutSummary(items)
    expect(result.lineItems).toEqual([
      { sku: 'A1', name: 'Widget', quantity: 2, unitPriceCents: 1000, lineTotalCents: 2000 },
      { sku: 'B2', name: 'Gadget', quantity: 3, unitPriceCents: 500, lineTotalCents: 1500 },
    ])
    expect(result.subtotalCents).toBe(3500)
    expect(result.discountCents).toBe(0)
    expect(result.taxCents).toBe(0)
    expect(result.totalCents).toBe(3500)
    expect(result.warnings).toEqual([])
  })

  it('applies valid coupon and tax', () => {
    const items: CartItem[] = [
      { sku: 'A1', name: 'Widget', quantity: 1, unitPriceCents: 1000 },
    ]
    const coupon = { code: 'SAVE10', percentOff: 10 }
    const result = buildCheckoutSummary(items, coupon, 0.08)
    expect(result.subtotalCents).toBe(1000)
    expect(result.discountCents).toBe(100)
    expect(result.taxCents).toBe(72) // 8% of (1000 - 100) = 72
    expect(result.totalCents).toBe(972)
    expect(result.appliedCouponCode).toBe('SAVE10')
    expect(result.warnings).toEqual([])
  })

  it('ignores invalid rows with warnings', () => {
    const items: CartItem[] = [
      { sku: 'A1', name: 'Widget', quantity: 2, unitPriceCents: 1000 },
      { sku: '', name: 'Bad Item', quantity: 1, unitPriceCents: 500 },
      { sku: 'B2', name: '', quantity: 1, unitPriceCents: 500 },
      { sku: 'C3', name: 'Zero Qty', quantity: 0, unitPriceCents: 500 },
      { sku: 'D4', name: 'Negative Price', quantity: 1, unitPriceCents: -100 },
      { sku: 'E5', name: 'Valid Item', quantity: 1, unitPriceCents: 2000 },
    ]
    const result = buildCheckoutSummary(items)
    expect(result.lineItems).toEqual([
      { sku: 'A1', name: 'Widget', quantity: 2, unitPriceCents: 1000, lineTotalCents: 2000 },
      { sku: 'E5', name: 'Valid Item', quantity: 1, unitPriceCents: 2000, lineTotalCents: 2000 },
    ])
    expect(result.subtotalCents).toBe(4000)
    expect(result.warnings).toHaveLength(4)
    expect(result.warnings).toContain(
      'Invalid row ignored: sku="", name="Bad Item", quantity=1, unitPriceCents=500',
    )
    expect(result.warnings).toContain(
      'Invalid row ignored: sku="B2", name="", quantity=1, unitPriceCents=500',
    )
    expect(result.warnings).toContain(
      'Invalid row ignored: sku="C3", name="Zero Qty", quantity=0, unitPriceCents=500',
    )
    expect(result.warnings).toContain(
      'Invalid row ignored: sku="D4", name="Negative Price", quantity=1, unitPriceCents=-100',
    )
  })

  it('ignores invalid coupon with warnings', () => {
    const items: CartItem[] = [
      { sku: 'A1', name: 'Widget', quantity: 1, unitPriceCents: 1000 },
    ]
    const couponZero = { code: 'ZERO', percentOff: 0 }
    const resultZero = buildCheckoutSummary(items, couponZero)
    expect(resultZero.discountCents).toBe(0)
    expect(resultZero.appliedCouponCode).toBeUndefined()
    expect(resultZero.warnings).toContain(
      'Invalid coupon ignored: code="ZERO", percentOff=0',
    )

    const couponNegative = { code: 'NEG', percentOff: -10 }
    const resultNeg = buildCheckoutSummary(items, couponNegative)
    expect(resultNeg.discountCents).toBe(0)
    expect(resultNeg.warnings).toContain(
      'Invalid coupon ignored: code="NEG", percentOff=-10',
    )

    const couponOver100 = { code: 'HUGE', percentOff: 150 }
    const resultOver = buildCheckoutSummary(items, couponOver100)
    expect(resultOver.discountCents).toBe(0)
    expect(resultOver.warnings).toContain(
      'Invalid coupon ignored: code="HUGE", percentOff=150',
    )
  })

  it('ignores invalid tax rate with warnings', () => {
    const items: CartItem[] = [
      { sku: 'A1', name: 'Widget', quantity: 1, unitPriceCents: 1000 },
    ]

    const resultNeg = buildCheckoutSummary(items, undefined, -0.1)
    expect(resultNeg.taxCents).toBe(0)
    expect(resultNeg.warnings).toContain('Invalid tax rate ignored: -0.1')

    const resultOver = buildCheckoutSummary(items, undefined, 1.5)
    expect(resultOver.taxCents).toBe(0)
    expect(resultOver.warnings).toContain('Invalid tax rate ignored: 1.5')
  })

  it('returns zero totals for fully invalid cart', () => {
    const items: CartItem[] = [
      { sku: '', name: 'Bad', quantity: 0, unitPriceCents: -1 },
      { sku: '', name: '', quantity: -1, unitPriceCents: 100 },
    ]
    const result = buildCheckoutSummary(items)
    expect(result.lineItems).toEqual([])
    expect(result.subtotalCents).toBe(0)
    expect(result.discountCents).toBe(0)
    expect(result.taxCents).toBe(0)
    expect(result.totalCents).toBe(0)
    expect(result.warnings).toHaveLength(2)
  })

  it('rounds discount and tax to nearest cent', () => {
    const items: CartItem[] = [
      { sku: 'A1', name: 'Widget', quantity: 3, unitPriceCents: 333 },
    ]
    const coupon = { code: 'THIRD', percentOff: 33 }
    const result = buildCheckoutSummary(items, coupon, 0.123)
    // subtotal: 999, discount: 330 (rounded), taxable: 669, tax: 82 (rounded)
    expect(result.subtotalCents).toBe(999)
    expect(result.discountCents).toBe(330)
    expect(result.taxCents).toBe(82)
    expect(result.totalCents).toBe(751)
  })

  it('handles whitespace-only sku and name as invalid', () => {
    const items: CartItem[] = [
      { sku: '   ', name: 'Widget', quantity: 1, unitPriceCents: 1000 },
      { sku: 'A1', name: '   ', quantity: 1, unitPriceCents: 1000 },
    ]
    const result = buildCheckoutSummary(items)
    expect(result.lineItems).toEqual([])
    expect(result.warnings).toHaveLength(2)
  })
})
