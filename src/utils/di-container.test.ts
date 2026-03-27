import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createToken, Container, DIDisposable } from './di-container'

describe('DI Container', () => {
  describe('Token creation', () => {
    it('should create unique tokens', () => {
      const token1 = createToken<string>('service1')
      const token2 = createToken<string>('service2')
      expect(token1).not.toBe(token2)
    })

    it('should preserve type information', () => {
      const stringToken = createToken<string>('string')
      const numToken = createToken<number>('number')
      const objToken = createToken<{ id: number }>('object')

      expect(stringToken).toBeDefined()
      expect(numToken).toBeDefined()
      expect(objToken).toBeDefined()
    })
  })

  describe('register and resolve', () => {
    it('should register and resolve a basic service', () => {
      const container = new Container()
      const token = createToken<string>('greeting')

      container.register(token, () => 'Hello, World!')

      const result = container.resolve(token)
      expect(result).toBe('Hello, World!')
    })

    it('should throw when resolving unregistered token', () => {
      const container = new Container()
      const token = createToken<string>('unknown')

      expect(() => container.resolve(token)).toThrow('No registration found')
    })
  })

  describe('singleton support', () => {
    it('should return the same instance for singleton', () => {
      const container = new Container()
      const token = createToken<{ id: number }>('singleton')
      let instanceCount = 0

      container.registerSingleton(token, () => {
        instanceCount++
        return { id: instanceCount }
      })

      const instance1 = container.resolve(token)
      const instance2 = container.resolve(token)

      expect(instance1).toBe(instance2)
      expect(instance1.id).toBe(1)
      expect(instance2.id).toBe(1)
      expect(instanceCount).toBe(1)
    })

    it('should create new instances for transient', () => {
      const container = new Container()
      const token = createToken<{ id: number }>('transient')
      let instanceCount = 0

      container.registerTransient(token, () => {
        instanceCount++
        return { id: instanceCount }
      })

      const instance1 = container.resolve(token)
      const instance2 = container.resolve(token)

      expect(instance1).not.toBe(instance2)
      expect(instance1.id).toBe(1)
      expect(instance2.id).toBe(2)
      expect(instanceCount).toBe(2)
    })
  })

  describe('dependency chains', () => {
    it('should resolve dependency chains', () => {
      const container = new Container()

      const databaseToken = createToken<{ query: () => string }>('database')
      const userServiceToken = createToken<{ getName: () => string }>('userService')
      const loggerToken = createToken<{ log: (msg: string) => void }>('logger')

      container.register(loggerToken, () => ({
        log: vi.fn(),
      }))

      container.register(databaseToken, () => ({
        query: () => 'John',
      }))

      container.register(userServiceToken, (c: Container) => ({
        getName: () => c.resolve(databaseToken).query(),
      }))

      const logger = container.resolve(loggerToken)
      const userService = container.resolve(userServiceToken)

      expect(userService.getName()).toBe('John')
      expect(logger.log).toBeDefined()
    })

    it('should support nested dependencies', () => {
      const container = new Container()

      const aToken = createToken<{ value: string }>('a')
      const bToken = createToken<{ aValue: string }>('b')
      const cToken = createToken<{ bValue: string }>('c')

      container.register(aToken, () => ({ value: 'A' }))
      container.register(bToken, (c: Container) => ({ aValue: c.resolve(aToken).value }))
      container.register(cToken, (c: Container) => ({ bValue: c.resolve(bToken).aValue }))

      const c = container.resolve(cToken)
      expect(c.bValue).toBe('A')
    })
  })

  describe('circular dependency detection', () => {
    it('should throw on circular dependency', () => {
      const container = new Container()

      const aToken = createToken<{ name: string }>('a')
      const bToken = createToken<{ name: string }>('b')

      container.register(aToken, (c: Container) => ({ name: c.resolve(bToken).name }))
      container.register(bToken, (c: Container) => ({ name: c.resolve(aToken).name }))

      expect(() => container.resolve(aToken)).toThrow(/Circular dependency detected/i)
    })

    it('should throw on self-referencing dependency', () => {
      const container = new Container()

      const token = createToken<{ ref: unknown }>('self')

      container.register(token, (c: Container) => ({ ref: c.resolve(token) }))

      expect(() => container.resolve(token)).toThrow(/Circular dependency detected/i)
    })

    it('should throw on three-way circular dependency', () => {
      const container = new Container()

      const aToken = createToken<{ name: string }>('a')
      const bToken = createToken<{ name: string }>('b')
      const cToken = createToken<{ name: string }>('c')

      container.register(aToken, (c: Container) => ({ name: c.resolve(bToken).name }))
      container.register(bToken, (c: Container) => ({ name: c.resolve(cToken).name }))
      container.register(cToken, (c: Container) => ({ name: c.resolve(aToken).name }))

      expect(() => container.resolve(aToken)).toThrow(/Circular dependency detected/i)
    })
  })

  describe('dispose support', () => {
    it('should call dispose on DIDisposable singletons', () => {
      const container = new Container()
      const token = createToken<{ id: number } & DIDisposable>('disposable')
      const disposeMock = vi.fn()

      const instance = {
        id: 1,
        dispose: disposeMock,
      }

      container.registerSingleton(token, () => instance)
      container.resolve(token)

      container.dispose()

      expect(disposeMock).toHaveBeenCalledTimes(1)
    })

    it('should not call dispose on non-DIDisposable singletons', () => {
      const container = new Container()
      const token = createToken<{ id: number }>('nonDIDisposable')

      container.registerSingleton(token, () => ({ id: 1 }))
      container.resolve(token)

      expect(() => container.dispose()).not.toThrow()
    })

    it('should not call dispose on transient instances', () => {
      const container = new Container()
      const token = createToken<{ id: number; dispose: () => void }>('transientDIDisposable')
      const disposeMock = vi.fn()

      container.registerTransient(token, () => ({
        id: 1,
        dispose: disposeMock,
      }))

      container.resolve(token)

      container.dispose()

      expect(disposeMock).not.toHaveBeenCalled()
    })

    it('should dispose multiple singletons', () => {
      const container = new Container()
      const token1 = createToken<DIDisposable>('disposable1')
      const token2 = createToken<DIDisposable>('disposable2')
      const disposeMock1 = vi.fn()
      const disposeMock2 = vi.fn()

      container.registerSingleton(token1, () => ({ dispose: disposeMock1 }))
      container.registerSingleton(token2, () => ({ dispose: disposeMock2 }))

      container.resolve(token1)
      container.resolve(token2)

      container.dispose()

      expect(disposeMock1).toHaveBeenCalledTimes(1)
      expect(disposeMock2).toHaveBeenCalledTimes(1)
    })
  })

  describe('child containers', () => {
    it('should inherit parent registrations', () => {
      const parent = new Container()
      const child = parent.createChild()

      const token = createToken<string>('shared')

      parent.register(token, () => 'parent value')

      expect(child.resolve(token)).toBe('parent value')
      expect(parent.resolve(token)).toBe('parent value')
    })

    it('should allow child to override parent registrations', () => {
      const parent = new Container()
      const child = parent.createChild()

      const token = createToken<string>('overridable')

      parent.register(token, () => 'parent')
      child.register(token, () => 'child')

      expect(child.resolve(token)).toBe('child')
      expect(parent.resolve(token)).toBe('parent')
    })

    it('should allow singleton override in child', () => {
      const parent = new Container()
      const child = parent.createChild()

      const token = createToken<{ id: number }>('singleton')
      let parentCount = 0
      let childCount = 0

      parent.registerSingleton(token, () => {
        parentCount++
        return { id: parentCount }
      })

      child.registerSingleton(token, () => {
        childCount++
        return { id: childCount }
      })

      const parentInstance = parent.resolve(token)
      const childInstance = child.resolve(token)

      expect(parentInstance.id).toBe(1)
      expect(childInstance.id).toBe(1)
      expect(parentCount).toBe(1)
      expect(childCount).toBe(1)

      // Second resolves should return cached instances
      expect(parent.resolve(token)).toBe(parentInstance)
      expect(child.resolve(token)).toBe(childInstance)
    })

    it('should have independent singleton caches', () => {
      const parent = new Container()
      const child = parent.createChild()

      const token = createToken<{ id: number }>('singleton')
      let instanceCount = 0

      parent.registerSingleton(token, () => {
        instanceCount++
        return { id: instanceCount }
      })

      const parentInstance = parent.resolve(token)
      const childInstance = child.resolve(token)

      expect(parentInstance).not.toBe(childInstance)
      expect(parentInstance.id).toBe(1)
      expect(childInstance.id).toBe(2)
      expect(instanceCount).toBe(2)
    })

    it('should dispose child without affecting parent singletons', () => {
      const parent = new Container()
      const child = parent.createChild()

      const token = createToken<{ id: number } & DIDisposable>('disposable')
      const disposeMock = vi.fn()

      parent.registerSingleton(token, () => ({
        id: 1,
        dispose: disposeMock,
      }))

      parent.resolve(token)
      child.resolve(token)

      child.dispose()

      expect(disposeMock).toHaveBeenCalledTimes(1)

      // Parent should still be able to resolve
      expect(() => parent.resolve(token)).not.toThrow()
    })

    it('should support nested child containers', () => {
      const grandparent = new Container()
      const parent = grandparent.createChild()
      const child = parent.createChild()

      const token = createToken<string>('nested')

      grandparent.register(token, () => 'grandparent')

      expect(child.resolve(token)).toBe('grandparent')

      parent.register(token, () => 'parent')
      expect(child.resolve(token)).toBe('parent')
      expect(parent.resolve(token)).toBe('parent')
      expect(grandparent.resolve(token)).toBe('grandparent')
    })
  })

  describe('edge cases', () => {
    it('should handle resolving after child dispose', () => {
      const parent = new Container()
      const child = parent.createChild()

      const token = createToken<string>('test')
      parent.register(token, () => 'parent')

      child.dispose()

      // Child is disposed but parent should still work
      expect(parent.resolve(token)).toBe('parent')
    })

    it('should throw when resolving from disposed container', () => {
      const container = new Container()
      const token = createToken<string>('test')

      container.register(token, () => 'value')

      container.dispose()

      expect(() => container.resolve(token)).toThrow(/Container has been disposed/i)
    })

    it('should throw when resolving from disposed child', () => {
      const parent = new Container()
      const child = parent.createChild()

      const token = createToken<string>('test')
      parent.register(token, () => 'value')

      child.dispose()

      expect(() => child.resolve(token)).toThrow(/Container has been disposed/i)
    })

    it('should allow re-registration in same container', () => {
      const container = new Container()
      const token = createToken<string>('re registrable')

      container.register(token, () => 'first')
      expect(container.resolve(token)).toBe('first')

      container.register(token, () => 'second')
      expect(container.resolve(token)).toBe('second')
    })
  })
})
