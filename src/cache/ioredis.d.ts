declare module 'ioredis' {
  import { EventEmitter } from 'events'

  interface RedisOptions {
    password?: string
    connectTimeout?: number
    retryStrategy?: (times: number) => number | null
  }

  class Redis extends EventEmitter {
    constructor(url: string, options?: RedisOptions)
    get(key: string): Promise<string | null>
    set(key: string, value: string, px?: string, ms?: number): Promise<'OK'>
    del(key: string): Promise<number>
    flushdb(): Promise<'OK'>
    ping(): Promise<string>
  }

  export default Redis
}