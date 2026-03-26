/**
 * Branded symbol type for type-safe dependency injection tokens.
 * The phantom type parameter T ensures type safety at compile time.
 */
export interface Token<T> {
  readonly __brand: T
  readonly __token: symbol
}

const tokenRegistry = new Map<symbol, unknown>()

/**
 * Creates a unique type-safe token for dependency injection.
 * @param name - A descriptive name for the token (used for debugging)
 * @returns A unique Token<T> instance
 */
export function createToken<T>(name: string): Token<T> {
  const symbolKey = Symbol(name)
  const token: Token<T> = {
    __brand: undefined as T,
    __token: symbolKey,
  }
  tokenRegistry.set(symbolKey, name)
  return token
}

/**
 * Factory function type for creating service instances.
 */
type Factory<T> = (container: Container) => T

/**
 * Registration entry storing the factory and lifecycle mode.
 */
interface Registration<T> {
  factory: Factory<T>
  lifecycle: 'singleton' | 'transient'
}

/**
 * Disposable interface for cleanup.
 */
export interface DIDisposable {
  dispose(): void
}

/**
 * A type-safe dependency injection container.
 */
export class Container {
  readonly registry = new Map<symbol, Registration<unknown>>()
  readonly singletons = new Map<symbol, unknown>()
  readonly resolving = new Set<symbol>()
  protected _disposed = false

  /**
   * Registers a factory function with the default singleton lifecycle.
   * @param token - The token to register
   * @param factory - Factory function to create the instance
   */
  register<T>(token: Token<T>, factory: () => T): void
  register<T>(token: Token<T>, factory: (container: Container) => T): void
  register<T>(token: Token<T>, factory: Factory<T>): void {
    this.checkDisposed()
    this.singletons.delete(token.__token)
    this.registry.set(token.__token, {
      factory,
      lifecycle: 'singleton',
    })
  }

  /**
   * Registers a singleton factory. The factory is called once and cached.
   * @param token - The token to register
   * @param factory - Factory function to create the singleton instance
   */
  registerSingleton<T>(token: Token<T>, factory: () => T): void
  registerSingleton<T>(token: Token<T>, factory: (container: Container) => T): void
  registerSingleton<T>(token: Token<T>, factory: Factory<T>): void {
    this.checkDisposed()
    this.singletons.delete(token.__token)
    this.registry.set(token.__token, {
      factory,
      lifecycle: 'singleton',
    })
  }

  /**
   * Registers a transient factory. A new instance is created on each resolve.
   * @param token - The token to register
   * @param factory - Factory function to create the instance
   */
  registerTransient<T>(token: Token<T>, factory: () => T): void
  registerTransient<T>(token: Token<T>, factory: (container: Container) => T): void
  registerTransient<T>(token: Token<T>, factory: Factory<T>): void {
    this.checkDisposed()
    this.registry.set(token.__token, {
      factory,
      lifecycle: 'transient',
    })
  }

  /**
   * Resolves an instance for the given token.
   * @param token - The token to resolve
   * @returns The resolved instance
   * @throws Error if the token is not registered
   */
  resolve<T>(token: Token<T>): T {
    this.checkDisposed()
    return this.resolveInternal(token.__token) as T
  }

  protected resolveInternal(tokenSymbol: symbol): unknown {
    const registration = this.registry.get(tokenSymbol)

    if (!registration) {
      const tokenName = tokenRegistry.get(tokenSymbol) || 'unknown'
      throw new Error(`No registration found for token: ${String(tokenName)}`)
    }

    // Check for circular dependency
    if (this.resolving.has(tokenSymbol)) {
      const tokenName = tokenRegistry.get(tokenSymbol) || 'unknown'
      throw new Error(
        `Circular dependency detected while resolving token: ${String(tokenName)}`
      )
    }

    // Return cached singleton if exists
    if (registration.lifecycle === 'singleton') {
      const cached = this.singletons.get(tokenSymbol)
      if (cached !== undefined) {
        return cached
      }
    }

    // Mark as resolving for circular dependency detection
    this.resolving.add(tokenSymbol)

    try {
      const instance = registration.factory(this)

      // Cache singleton
      if (registration.lifecycle === 'singleton') {
        this.singletons.set(tokenSymbol, instance)
      }

      return instance
    } finally {
      this.resolving.delete(tokenSymbol)
    }
  }

  /**
   * Creates a child container that inherits parent registrations.
   * Child containers can override parent registrations.
   */
  createChild(): Container {
    this.checkDisposed()
    const child = new ChildContainer(this)
    return child
  }

  /**
   * Disposes the container and all its singletons that implement Disposable.
   */
  dispose(): void {
    if (this._disposed) return

    for (const instance of this.singletons.values()) {
      if (this.isDisposable(instance)) {
        instance.dispose()
      }
    }

    this.singletons.clear()
    this._disposed = true
  }

  protected isDisposable(instance: unknown): instance is DIDisposable {
    return (
      instance !== null &&
      typeof instance === 'object' &&
      'dispose' in instance &&
      typeof (instance as Record<string, unknown>).dispose === 'function'
    )
  }

  protected checkDisposed(): void {
    if (this._disposed) {
      throw new Error('Container has been disposed')
    }
  }
}

/**
 * Child container that inherits registrations from its parent.
 */
class ChildContainer extends Container {
  private readonly parent: Container
  private readonly childRegistry = new Map<symbol, Registration<unknown>>()
  readonly singletons = new Map<symbol, unknown>()
  readonly resolving = new Set<symbol>()
  private readonly cachedRegistrations = new Map<symbol, { factory: Factory<unknown> }>()
  private _childDisposed = false

  constructor(parent: Container) {
    super()
    this.parent = parent
  }

  override register<T>(token: Token<T>, factory: Factory<T>): void {
    this.checkDisposed()
    this.singletons.delete(token.__token)
    this.childRegistry.set(token.__token, {
      factory,
      lifecycle: 'singleton',
    })
  }

  override registerSingleton<T>(token: Token<T>, factory: Factory<T>): void {
    this.checkDisposed()
    this.singletons.delete(token.__token)
    this.childRegistry.set(token.__token, {
      factory,
      lifecycle: 'singleton',
    })
  }

  override registerTransient<T>(token: Token<T>, factory: Factory<T>): void {
    this.checkDisposed()
    this.childRegistry.set(token.__token, {
      factory,
      lifecycle: 'transient',
    })
  }

  override resolve<T>(token: Token<T>): T {
    this.checkDisposed()
    return this.resolveInternal(token.__token) as T
  }

  protected resolveInternal(tokenSymbol: symbol): unknown {
    // Check child's own registry first (takes precedence)
    const childReg = this.childRegistry.get(tokenSymbol)
    if (childReg) {
      return this.resolveFromChildRegistration(tokenSymbol, childReg)
    }

    // Delegate to parent for inherited registration
    return this.resolveFromParent(tokenSymbol)
  }

  private resolveFromChildRegistration(
    tokenSymbol: symbol,
    registration: Registration<unknown>
  ): unknown {
    if (this.resolving.has(tokenSymbol)) {
      const tokenName = tokenRegistry.get(tokenSymbol) || 'unknown'
      throw new Error(
        `Circular dependency detected while resolving token: ${String(tokenName)}`
      )
    }

    if (registration.lifecycle === 'singleton') {
      const cached = this.singletons.get(tokenSymbol)
      if (cached !== undefined) {
        return cached
      }
    }

    this.resolving.add(tokenSymbol)

    try {
      const instance = registration.factory(this)

      if (registration.lifecycle === 'singleton') {
        this.singletons.set(tokenSymbol, instance)
        this.cachedRegistrations.set(tokenSymbol, { factory: registration.factory })
      }

      return instance
    } finally {
      this.resolving.delete(tokenSymbol)
    }
  }

  private resolveFromParent(tokenSymbol: symbol): unknown {
    if (this.resolving.has(tokenSymbol)) {
      const tokenName = tokenRegistry.get(tokenSymbol) || 'unknown'
      throw new Error(
        `Circular dependency detected while resolving token: ${String(tokenName)}`
      )
    }

    // Find the registration from parent chain (closest to child wins)
    const registrationInfo = this.findRegistrationInParentChain(tokenSymbol)
    if (!registrationInfo) {
      const tokenName = tokenRegistry.get(tokenSymbol) || 'unknown'
      throw new Error(`No registration found for token: ${String(tokenName)}`)
    }

    const { registration } = registrationInfo

    // Check if cached singleton is still valid
    if (registration.lifecycle === 'singleton') {
      const cached = this.singletons.get(tokenSymbol)
      if (cached !== undefined) {
        const cachedInfo = this.cachedRegistrations.get(tokenSymbol)
        if (cachedInfo && cachedInfo.factory === registration.factory) {
          return cached
        }
        // Registration changed, invalidate cache
        this.singletons.delete(tokenSymbol)
      }
    }

    this.resolving.add(tokenSymbol)

    try {
      const instance = registration.factory(this)

      if (registration.lifecycle === 'singleton') {
        this.singletons.set(tokenSymbol, instance)
        this.cachedRegistrations.set(tokenSymbol, { factory: registration.factory })
      }

      return instance
    } finally {
      this.resolving.delete(tokenSymbol)
    }
  }

  private findRegistrationInParentChain(
    tokenSymbol: symbol
  ): { registration: Registration<unknown>; depth: number } | undefined {
    let currentParent: Container | undefined = this.parent
    let depth = 1

    while (currentParent) {
      // Get the registration from current parent
      const parentAsChild = currentParent as ChildContainer
      const reg = parentAsChild.childRegistry?.get(tokenSymbol) ?? currentParent.registry.get(tokenSymbol)

      if (reg) {
        // Found the closest (most specific) registration, return immediately
        return { registration: reg, depth }
      }

      // Traverse up to next parent
      if (parentAsChild.parent) {
        currentParent = parentAsChild.parent
        depth++
      } else {
        break
      }
    }

    return undefined
  }

  override dispose(): void {
    if (this._childDisposed) return

    // Dispose only child's own singletons
    for (const instance of this.singletons.values()) {
      if (this.isDisposable(instance)) {
        instance.dispose()
      }
    }

    this.singletons.clear()
    this._childDisposed = true
  }

  protected checkDisposed(): void {
    if (this._childDisposed) {
      throw new Error('Container has been disposed')
    }
  }
}
