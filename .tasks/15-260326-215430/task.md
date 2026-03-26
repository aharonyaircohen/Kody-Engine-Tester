# Add a type-safe dependency injection container

Create a lightweight dependency injection (DI) container with full TypeScript type safety.

Requirements:
1. Container class with typed register/resolve:
   - container.register<T>(token: Token<T>, factory: () => T): void
   - container.resolve<T>(token: Token<T>): T
   - Token<T> is a branded type for type-safe lookups

2. Singleton support: container.registerSingleton<T>(token, factory) — factory called once, cached

3. Transient support: container.registerTransient<T>(token, factory) — factory called every resolve

4. Dependency chains: factories can call container.resolve() for their own deps

5. Circular dependency detection: throw clear error if A depends on B depends on A

6. Dispose support: container.dispose() calls cleanup on all singletons that implement Disposable

7. Child containers: container.createChild() inherits parent registrations, can override

Save to src/utils/di-container.ts with comprehensive tests in src/utils/di-container.test.ts covering all 7 requirements.