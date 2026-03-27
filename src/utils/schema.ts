// Schema builder with type inference (mini-Zod)

export class SchemaError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SchemaError'
  }
}

type Infer<T extends AnySchema> = T['_type']

// Base schema class
abstract class Schema<T> {
  readonly _type!: T
  protected _optional = false
  protected _hasDefault = false
  protected _defaultValue: T | undefined

  abstract _validate(input: unknown): T

  parse(input: unknown): T {
    if (input === undefined || input === null) {
      if (this._hasDefault) return this._defaultValue as T
      if (this._optional) return undefined as unknown as T
      throw new SchemaError(`Expected value but received ${input}`)
    }
    return this._validate(input)
  }

  optional(): Schema<T | undefined> {
    const clone = this._clone() as Schema<T | undefined>
    clone._optional = true
    return clone
  }

  default(value: T): Schema<T> {
    const clone = this._clone()
    clone._hasDefault = true
    clone._defaultValue = value
    return clone
  }

  protected abstract _clone(): this
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySchema = Schema<any>

class StringSchema extends Schema<string> {
  _validate(input: unknown): string {
    if (typeof input !== 'string') {
      throw new SchemaError(`Expected string but received ${typeof input}`)
    }
    return input
  }

  protected _clone(): this {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this)
  }
}

class NumberSchema extends Schema<number> {
  _validate(input: unknown): number {
    if (typeof input !== 'number' || Number.isNaN(input)) {
      throw new SchemaError(`Expected number but received ${typeof input}`)
    }
    return input
  }

  protected _clone(): this {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this)
  }
}

class BooleanSchema extends Schema<boolean> {
  _validate(input: unknown): boolean {
    if (typeof input !== 'boolean') {
      throw new SchemaError(`Expected boolean but received ${typeof input}`)
    }
    return input
  }

  protected _clone(): this {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this)
  }
}

class ArraySchema<T> extends Schema<T[]> {
  constructor(private readonly _itemSchema: Schema<T>) {
    super()
  }

  _validate(input: unknown): T[] {
    if (!Array.isArray(input)) {
      throw new SchemaError(`Expected array but received ${typeof input}`)
    }
    return input.map((item, i) => {
      try {
        return this._itemSchema.parse(item)
      } catch (e) {
        throw new SchemaError(`At index ${i}: ${(e as Error).message}`)
      }
    })
  }

  protected _clone(): this {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this)
  }
}

type ObjectShape = Record<string, AnySchema>
type InferObject<S extends ObjectShape> = {
  [K in keyof S]: Infer<S[K]>
}

class ObjectSchema<S extends ObjectShape> extends Schema<InferObject<S>> {
  constructor(private readonly _shape: S) {
    super()
  }

  _validate(input: unknown): InferObject<S> {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
      throw new SchemaError(`Expected object but received ${Array.isArray(input) ? 'array' : typeof input}`)
    }
    const result = {} as InferObject<S>
    for (const key in this._shape) {
      const fieldSchema = this._shape[key]
      const value = (input as Record<string, unknown>)[key]
      try {
        result[key] = fieldSchema.parse(value)
      } catch (e) {
        throw new SchemaError(`At key "${key}": ${(e as Error).message}`)
      }
    }
    return result
  }

  protected _clone(): this {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this)
  }
}

// Builder namespace
export const s = {
  string: () => new StringSchema(),
  number: () => new NumberSchema(),
  boolean: () => new BooleanSchema(),
  array: <T>(schema: Schema<T>) => new ArraySchema(schema),
  object: <S extends ObjectShape>(shape: S) => new ObjectSchema(shape),
  infer: undefined as unknown as <T extends AnySchema>(schema: T) => Infer<T>,
}

// Type-level only utility (no runtime value needed)
export type { Infer as infer }
