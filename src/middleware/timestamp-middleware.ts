import type { Request, Response, NextFunction } from 'express'

export type TimestampMiddlewareConfig = {
  headerName?: string
}

export function createTimestampMiddleware(config: TimestampMiddlewareConfig = {}): (req: Request, res: Response, next: NextFunction) => void {
  const headerName = config.headerName ?? 'X-Response-Time'

  return function timestampMiddleware(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now()

    // Override res.json to capture the response
    const originalJson = res.json.bind(res)
    res.json = function (body: unknown) {
      res.setHeader(headerName, String(Date.now() - startTime))
      return originalJson(body)
    }

    // Override res.send to capture the response
    const originalSend = res.send.bind(res)
    res.send = function (body: unknown) {
      res.setHeader(headerName, String(Date.now() - startTime))
      return originalSend(body)
    }

    // Also set header on finish in case neither json nor send is called
    res.on('finish', () => {
      if (!res.headersSent) {
        res.setHeader(headerName, String(Date.now() - startTime))
      }
    })

    next()
  }
}