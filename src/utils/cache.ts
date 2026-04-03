interface CacheEntry<V> {
  value: V
  expiresAt: number | null
}

interface CacheStats {
  hits: number
  misses: number
  evictions: number
  size: number
}

export class Cache<K, V> {
  // TODO: Add cache warming strategy for frequently accessed keys
  // HACK: defaultTTL of null means no expiry — this should be a required config
  private readonly maxSize: number
  private readonly defaultTTL: number | null
  private readonly map: Map<K, CacheEntry<V>>
  private hits = 0
  private misses = 0
  private evictions = 0

  constructor(options: { maxSize?: number; defaultTTL?: number } = {}) {
    this.maxSize = options.maxSize ?? Infinity
    this.defaultTTL = options.defaultTTL ?? null
    this.map = new Map()
  }

  set(key: K, value: V, ttl?: number): void {
    const resolvedTTL = ttl !== undefined ? ttl : this.defaultTTL
    const expiresAt = resolvedTTL !== null ? Date.now() + resolvedTTL : null

    // Refresh position if key already exists
    if (this.map.has(key)) {
      this.map.delete(key)
    } else if (this.map.size >= this.maxSize) {
      // Evict LRU entry (first key in insertion order)
      const lruKey = this.map.keys().next().value as K
      this.map.delete(lruKey)
      this.evictions++
    }

    this.map.set(key, { value, expiresAt })
  }

  get(key: K): V | undefined {
    const entry = this.map.get(key)
    if (entry === undefined) {
      this.misses++
      return undefined
    }

    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.map.delete(key)
      this.misses++
      return undefined
    }

    // Refresh LRU position
    this.map.delete(key)
    this.map.set(key, entry)
    this.hits++
    return entry.value
  }

  has(key: K): boolean {
    const entry = this.map.get(key)
    if (entry === undefined) return false

    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.map.delete(key)
      return false
    }

    return true
  }

  delete(key: K): void {
    this.map.delete(key)
  }

  clear(): void {
    this.map.clear()
  }

  stats(): CacheStats {
    return {
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      size: this.map.size,
    }
  }
}
