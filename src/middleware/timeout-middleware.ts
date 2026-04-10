import { NextRequest, NextResponse } from 'next/server'

export interface TimeoutMiddlewareConfig {
  defaultTimeoutMs?: number
}

type TimeoutListener = () => void

interface TimeoutRequest extends NextRequest {
  timeout?: number
  onTimeout(listener: TimeoutListener): void
  offTimeout(listener: TimeoutListener): void
}

// Use WeakMap to store timeout listeners per request
const timeoutListenersMap = new WeakMap<NextRequest, Set<TimeoutListener>>()

export function addTimeoutListener(request: NextRequest, listener: TimeoutListener): void {
  let listeners = timeoutListenersMap.get(request)
  if (!listeners) {
    listeners = new Set()
    timeoutListenersMap.set(request, listeners)
  }
  listeners.add(listener)
}

export function removeTimeoutListener(request: NextRequest, listener: TimeoutListener): void {
  const listeners = timeoutListenersMap.get(request)
  listeners?.delete(listener)
}

function emitTimeout(request: NextRequest): void {
  const listeners = timeoutListenersMap.get(request)
  if (listeners) {
    for (const listener of listeners) {
      listener()
    }
  }
}

export function createTimeoutMiddleware(config: TimeoutMiddlewareConfig = {}) {
  const defaultTimeoutMs = config.defaultTimeoutMs ?? 30_000

  function getTimeoutMs(request: NextRequest): number {
    return (request as TimeoutRequest).timeout ?? defaultTimeoutMs
  }

  async function timeoutMiddleware(
    request: NextRequest,
    handler: () => Promise<Response>
  ): Promise<NextResponse> {
    const timeoutMs = getTimeoutMs(request)
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let isTimedOut = false

    return new Promise((resolve) => {
      const timeoutHandler = () => {
        if (!isTimedOut) {
          isTimedOut = true
          emitTimeout(request)
          resolve(
            new NextResponse(JSON.stringify({ error: 'Gateway Timeout' }), {
              status: 504,
              headers: { 'Content-Type': 'application/json' },
            })
          )
        }
      }

      timeoutId = setTimeout(timeoutHandler, timeoutMs)

      handler()
        .then((response) => {
          if (timeoutId !== null) {
            clearTimeout(timeoutId)
            timeoutId = null
          }
          if (!isTimedOut) {
            if (response instanceof NextResponse) {
              resolve(response)
            } else {
              // For plain Response, create a NextResponse from the body
              response
                .text()
                .then((text) => {
                  resolve(
                    new NextResponse(text, {
                      status: response.status,
                      headers: response.headers,
                    })
                  )
                })
                .catch(() => {
                  resolve(
                    new NextResponse('Internal Server Error', {
                      status: 500,
                    })
                  )
                })
            }
          }
          return response
        })
        .catch((error) => {
          if (timeoutId !== null) {
            clearTimeout(timeoutId)
            timeoutId = null
          }
          if (!isTimedOut) {
            resolve(
              new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
              })
            )
          }
        })
    }) as Promise<NextResponse>
  }

  // Attach helper methods for testing
  const extendedMiddleware = Object.assign(timeoutMiddleware, {
    addTimeoutListener,
    removeTimeoutListener,
  })

  return extendedMiddleware
}