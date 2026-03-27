export type Result<T, E = Error> = Ok<T, E> | Err<T, E>

interface ResultMethods<T, E> {
  isOk(): this is Ok<T, E>
  isErr(): this is Err<T, E>
  unwrap(): T
  unwrapOr(defaultValue: T): T
  map<U>(fn: (value: T) => U): Result<U, E>
  mapErr<F>(fn: (error: E) => F): Result<T, F>
  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E>
  match<U>(handlers: { ok: (value: T) => U; err: (error: E) => U }): U
}

export class Ok<T, E = Error> implements ResultMethods<T, E> {
  readonly _tag = 'Ok' as const
  constructor(readonly value: T) {}

  isOk(): this is Ok<T, E> {
    return true
  }

  isErr(): this is Err<T, E> {
    return false
  }

  unwrap(): T {
    return this.value
  }

  unwrapOr(_defaultValue: T): T {
    return this.value
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return new Ok(fn(this.value))
  }

  mapErr<F>(_fn: (error: E) => F): Result<T, F> {
    return new Ok(this.value)
  }

  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.value)
  }

  match<U>(handlers: { ok: (value: T) => U; err: (error: E) => U }): U {
    return handlers.ok(this.value)
  }
}

export class Err<T, E = Error> implements ResultMethods<T, E> {
  readonly _tag = 'Err' as const
  constructor(readonly error: E) {}

  isOk(): this is Ok<T, E> {
    return false
  }

  isErr(): this is Err<T, E> {
    return true
  }

  unwrap(): T {
    throw this.error
  }

  unwrapOr(defaultValue: T): T {
    return defaultValue
  }

  map<U>(_fn: (value: T) => U): Result<U, E> {
    return new Err(this.error)
  }

  mapErr<F>(fn: (error: E) => F): Result<T, F> {
    return new Err(fn(this.error))
  }

  andThen<U>(_fn: (value: T) => Result<U, E>): Result<U, E> {
    return new Err(this.error)
  }

  match<U>(handlers: { ok: (value: T) => U; err: (error: E) => U }): U {
    return handlers.err(this.error)
  }
}

export function ok<T, E = Error>(value: T): Result<T, E> {
  return new Ok(value)
}

export function err<T, E = Error>(error: E): Result<T, E> {
  return new Err(error)
}

export function tryCatch<T>(fn: () => T): Result<T, Error> {
  try {
    return ok(fn())
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)))
  }
}

export async function fromPromise<T>(promise: Promise<T>): Promise<Result<T, Error>> {
  try {
    return ok(await promise)
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)))
  }
}
