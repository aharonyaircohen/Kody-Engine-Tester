export type Middleware<TContext> = (
  ctx: TContext,
  next: () => Promise<void>,
) => Promise<void>

export type ErrorMiddleware<TContext> = (
  err: Error,
  ctx: TContext,
  next: () => Promise<void>,
) => Promise<void>

export interface Pipeline<TContext> {
  use(mw: Middleware<TContext>): this
  useError(mw: ErrorMiddleware<TContext>): this
  run(ctx: TContext): Promise<void>
}

export function createPipeline<TContext>(): Pipeline<TContext> {
  const middleware: Middleware<TContext>[] = []
  const errorMiddleware: ErrorMiddleware<TContext>[] = []

  const pipeline: Pipeline<TContext> = {
    use(mw) {
      middleware.push(mw)
      return this
    },

    useError(mw) {
      errorMiddleware.push(mw)
      return this
    },

    async run(ctx) {
      let index = 0

      const next = async (): Promise<void> => {
        if (index < middleware.length) {
          const mw = middleware[index++]
          await mw(ctx, next)
        }
      }

      try {
        await next()
      } catch (err) {
        if (!(err instanceof Error)) throw err

        let errorIndex = 0

        const nextError = async (): Promise<void> => {
          if (errorIndex < errorMiddleware.length) {
            const mw = errorMiddleware[errorIndex++]
            await mw(err, ctx, nextError)
          }
        }

        await nextError()
      }
    },
  }

  return pipeline
}
