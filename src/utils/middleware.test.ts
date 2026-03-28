import { describe, expect, it } from 'vitest'
import { createPipeline } from './middleware'

describe('middleware pipeline', () => {
  it('createPipeline returns a pipeline builder', () => {
    const pipeline = createPipeline<{ count: number }>()
    expect(pipeline).toBeDefined()
    expect(typeof pipeline.use).toBe('function')
    expect(typeof pipeline.useError).toBe('function')
    expect(typeof pipeline.run).toBe('function')
  })

  it('.use() adds middleware and returns this for chaining', () => {
    const pipeline = createPipeline<{ steps: string[] }>()
    const result = pipeline.use((ctx, next) => {
      ctx.steps.push('a')
      return next()
    })
    expect(result).toBe(pipeline)
  })

  it('.run(ctx) executes middleware in order', async () => {
    const ctx = { steps: [] as string[] }
    createPipeline<typeof ctx>()
      .use((ctx, next) => {
        ctx.steps.push('first')
        return next()
      })
      .use((ctx, next) => {
        ctx.steps.push('second')
        return next()
      })
      .use((ctx, next) => {
        ctx.steps.push('third')
        return next()
      })
      .run(ctx)

    expect(ctx.steps).toEqual(['first', 'second', 'third'])
  })

  it('short-circuit: pipeline stops when middleware does not call next()', async () => {
    const ctx = { steps: [] as string[] }
    createPipeline<typeof ctx>()
      .use(async (ctx, next) => {
        ctx.steps.push('first')
        return next()
      })
      .use(async (ctx) => {
        // does not call next — short-circuits
        ctx.steps.push('STOP')
      })
      .use(async (ctx, next) => {
        ctx.steps.push('should not run')
        return next()
      })
      .run(ctx)

    expect(ctx.steps).toEqual(['first', 'STOP'])
  })

  it('error middleware via .useError() is called when a middleware throws', async () => {
    const ctx = { steps: [] as string[], error: '' }
    await createPipeline<typeof ctx>()
      .useError(async (err, ctx) => {
        ctx.error = err.message
        ctx.steps.push('error-caught')
      })
      .use((ctx, next) => {
        ctx.steps.push('before')
        return next()
      })
      .use((ctx) => {
        ctx.steps.push('throws')
        throw new Error('boom')
      })
      .run(ctx)

    expect(ctx.error).toBe('boom')
    expect(ctx.steps).toEqual(['before', 'throws', 'error-caught'])
  })

  it('errors propagate to error middleware and stop regular middleware', async () => {
    const ctx = { steps: [] as string[], error: '' }
    await createPipeline<typeof ctx>()
      .useError(async (err, ctx) => {
        ctx.error = err.message
        ctx.steps.push('handled')
      })
      .use(async (ctx, next) => {
        ctx.steps.push('a')
        return next()
      })
      .use(async (ctx) => {
        ctx.steps.push('b')
        throw new Error('fail')
      })
      .use(async (ctx, next) => {
        ctx.steps.push('c-should-not-run')
        return next()
      })
      .run(ctx)

    expect(ctx.steps).toEqual(['a', 'b', 'handled'])
    expect(ctx.error).toBe('fail')
  })

  it('async middleware works correctly', async () => {
    const ctx = { steps: [] as string[] }
    await createPipeline<typeof ctx>()
      .use(async (ctx, next) => {
        ctx.steps.push('one')
        await next()
      })
      .use(async (ctx, next) => {
        await new Promise((r) => setTimeout(r, 10))
        ctx.steps.push('two')
        await next()
      })
      .use(async (ctx, next) => {
        ctx.steps.push('three')
        await next()
      })
      .run(ctx)

    expect(ctx.steps).toEqual(['one', 'two', 'three'])
  })

  it('mixed error and regular middleware ordering', async () => {
    const ctx = { steps: [] as string[], error: '' }
    await createPipeline<typeof ctx>()
      .use(async (ctx, next) => {
        ctx.steps.push('start')
        await next()
      })
      .useError(async (err, ctx) => {
        ctx.steps.push('err-1')
        ctx.error = err.message
      })
      .use(async (ctx, next) => {
        ctx.steps.push('middle')
        await next()
      })
      .useError(async (err, ctx) => {
        ctx.steps.push('err-2')
        ctx.error = err.message
      })
      .use(async (ctx, _next) => {
        ctx.steps.push('throws')
        throw new Error('async boom')
      })
      .use(async (ctx, next) => {
        ctx.steps.push('after-throw')
        await next()
      })
      .run(ctx)

    expect(ctx.steps).toEqual(['start', 'middle', 'throws', 'err-1'])
    expect(ctx.error).toBe('async boom')
  })

  it('empty pipeline runs without error', async () => {
    const ctx = { count: 0 }
    await createPipeline<typeof ctx>().run(ctx)
    expect(ctx.count).toBe(0)
  })

  it('.useError() returns this for chaining', () => {
    const pipeline = createPipeline<Record<string, never>>()
    const result = pipeline.useError((err, _ctx) => {
      throw err
    })
    expect(result).toBe(pipeline)
  })
})
