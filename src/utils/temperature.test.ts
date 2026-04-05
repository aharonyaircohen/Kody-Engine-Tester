import { describe, expect, it } from 'vitest'

import {
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  celsiusToKelvin,
  kelvinToCelsius,
  fahrenheitToKelvin,
  kelvinToFahrenheit,
} from './temperature'

describe('celsiusToFahrenheit', () => {
  it('converts freezing point correctly', () => {
    expect(celsiusToFahrenheit(0)).toBe(32)
  })

  it('converts boiling point correctly', () => {
    expect(celsiusToFahrenheit(100)).toBe(212)
  })

  it('converts negative temperatures correctly', () => {
    expect(celsiusToFahrenheit(-40)).toBe(-40)
  })

  it('converts body temperature correctly', () => {
    expect(celsiusToFahrenheit(37)).toBeCloseTo(98.6, 1)
  })
})

describe('fahrenheitToCelsius', () => {
  it('converts freezing point correctly', () => {
    expect(fahrenheitToCelsius(32)).toBe(0)
  })

  it('converts boiling point correctly', () => {
    expect(fahrenheitToCelsius(212)).toBe(100)
  })

  it('converts negative temperatures correctly', () => {
    expect(fahrenheitToCelsius(-40)).toBe(-40)
  })
})

describe('celsiusToKelvin', () => {
  it('converts freezing point correctly', () => {
    expect(celsiusToKelvin(0)).toBeCloseTo(273.15, 2)
  })

  it('converts boiling point correctly', () => {
    expect(celsiusToKelvin(100)).toBeCloseTo(373.15, 2)
  })

  it('converts absolute zero correctly', () => {
    expect(celsiusToKelvin(-273.15)).toBeCloseTo(0, 2)
  })
})

describe('kelvinToCelsius', () => {
  it('converts freezing point correctly', () => {
    expect(kelvinToCelsius(273.15)).toBeCloseTo(0, 2)
  })

  it('converts boiling point correctly', () => {
    expect(kelvinToCelsius(373.15)).toBeCloseTo(100, 2)
  })

  it('converts absolute zero correctly', () => {
    expect(kelvinToCelsius(0)).toBeCloseTo(-273.15, 2)
  })
})

describe('fahrenheitToKelvin', () => {
  it('converts freezing point correctly', () => {
    expect(fahrenheitToKelvin(32)).toBeCloseTo(273.15, 1)
  })

  it('converts boiling point correctly', () => {
    expect(fahrenheitToKelvin(212)).toBeCloseTo(373.15, 1)
  })
})

describe('kelvinToFahrenheit', () => {
  it('converts freezing point correctly', () => {
    expect(kelvinToFahrenheit(273.15)).toBeCloseTo(32, 1)
  })

  it('converts boiling point correctly', () => {
    expect(kelvinToFahrenheit(373.15)).toBeCloseTo(212, 1)
  })
})
