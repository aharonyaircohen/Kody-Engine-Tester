import { describe, it, expect } from 'vitest'
import { ok, err, tryCatch, fromPromise, Ok as _Ok, Err } from './result'

describe('Ok', () => {
  it('isOk returns true', () => {
    expect(ok(1).isOk()).toBe(true)
  })

  it('isErr returns false', () => {
    expect(ok(1).isErr()).toBe(false)
  })

  it('unwrap returns the value', () => {
    expect(ok(42).unwrap()).toBe(42)
  })

  it('unwrapOr returns the value, not the default', () => {
    expect(ok(42).unwrapOr(0)).toBe(42)
  })

  it('map transforms the value', () => {
    const result = ok(2).map((x) => x * 3)
    expect(result.unwrap()).toBe(6)
  })

  it('mapErr is a no-op on Ok', () => {
    const result = ok<number, Error>(2).mapErr(() => new Error('nope'))
    expect(result.unwrap()).toBe(2)
  })

  it('andThen chains into another Result', () => {
    const result = ok(2).andThen((x) => ok(x + 1))
    expect(result.unwrap()).toBe(3)
  })

  it('andThen propagates Err from the callback', () => {
    const result = ok(2).andThen((_x) => err(new Error('fail')))
    expect(result.isErr()).toBe(true)
  })

  it('match calls the ok handler', () => {
    const value = ok(7).match({ ok: (v) => v * 2, err: () => -1 })
    expect(value).toBe(14)
  })
})

describe('Err', () => {
  it('isOk returns false', () => {
    expect(err(new Error('e')).isOk()).toBe(false)
  })

  it('isErr returns true', () => {
    expect(err(new Error('e')).isErr()).toBe(true)
  })

  it('unwrap throws the error', () => {
    const error = new Error('boom')
    expect(() => err(error).unwrap()).toThrow('boom')
  })

  it('unwrapOr returns the default', () => {
    expect(err<number>(new Error('e')).unwrapOr(99)).toBe(99)
  })

  it('map is a no-op on Err', () => {
    const result = err<number>(new Error('e')).map((x) => x * 2)
    expect(result.isErr()).toBe(true)
  })

  it('mapErr transforms the error', () => {
    const result = err<number, string>('original').mapErr((e) => `wrapped: ${e}`)
    expect((result as Err<number, string>).error).toBe('wrapped: original')
  })

  it('andThen is a no-op on Err', () => {
    const result = err<number>(new Error('e')).andThen((x) => ok(x + 1))
    expect(result.isErr()).toBe(true)
  })

  it('match calls the err handler', () => {
    const value = err<number>(new Error('oops')).match({
      ok: () => 1,
      err: (e) => e.message.length,
    })
    expect(value).toBe(4)
  })
})

describe('type narrowing', () => {
  it('narrows to Ok after isOk()', () => {
    const result = ok(42) as ReturnType<typeof ok<number>>
    if (result.isOk()) {
      // TypeScript should allow accessing .value here
      expect(result.value).toBe(42)
    }
  })

  it('narrows to Err after isErr()', () => {
    const error = new Error('narrow')
    const result = err(error) as ReturnType<typeof err<number>>
    if (result.isErr()) {
      // TypeScript should allow accessing .error here
      expect(result.error).toBe(error)
    }
  })
})

describe('tryCatch', () => {
  it('returns Ok when function succeeds', () => {
    const result = tryCatch(() => 42)
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBe(42)
  })

  it('returns Err when function throws an Error', () => {
    const result = tryCatch(() => {
      throw new Error('bad')
    })
    expect(result.isErr()).toBe(true)
    expect((result as Err<never, Error>).error.message).toBe('bad')
  })

  it('wraps non-Error throws into an Error', () => {
    const result = tryCatch(() => {
      throw 'string error'
    })
    expect(result.isErr()).toBe(true)
    expect((result as Err<never, Error>).error).toBeInstanceOf(Error)
    expect((result as Err<never, Error>).error.message).toBe('string error')
  })
})

describe('fromPromise', () => {
  it('returns Ok when promise resolves', async () => {
    const result = await fromPromise(Promise.resolve('hello'))
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBe('hello')
  })

  it('returns Err when promise rejects with an Error', async () => {
    const result = await fromPromise(Promise.reject(new Error('async fail')))
    expect(result.isErr()).toBe(true)
    expect((result as Err<never, Error>).error.message).toBe('async fail')
  })

  it('wraps non-Error rejections into an Error', async () => {
    const result = await fromPromise(Promise.reject('oops'))
    expect(result.isErr()).toBe(true)
    expect((result as Err<never, Error>).error).toBeInstanceOf(Error)
    expect((result as Err<never, Error>).error.message).toBe('oops')
  })
})
