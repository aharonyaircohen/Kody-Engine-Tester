import React, { Component, ReactNode } from 'react'

export interface ErrorInfo {
  error: Error
  componentStack?: string
  timestamp: Date
}

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  fallbackRender?: (info: ErrorInfo) => ReactNode
  onError?: (error: Error, componentStack: string, timestamp: Date) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  componentStack: string | null
  timestamp: Date | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, componentStack: null, timestamp: null }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error, timestamp: new Date() }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.props.onError?.(error, info.componentStack ?? '', new Date())
    this.setState({ componentStack: info.componentStack ?? '' })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, componentStack: null, timestamp: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const { fallback, fallbackRender } = this.props
      const info: ErrorInfo = {
        error: this.state.error,
        componentStack: this.state.componentStack ?? undefined,
        timestamp: this.state.timestamp ?? new Date(),
      }

      if (fallbackRender) {
        return <>{fallbackRender(info)}</>
      }

      if (fallback) {
        return <>{fallback}</>
      }

      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p style={{ color: '#cc0000' }}>{this.state.error.message}</p>
          {process.env.NODE_ENV === 'development' && this.state.componentStack && (
            <pre style={{ textAlign: 'left', background: '#f5f5f5', padding: '1rem', overflow: 'auto' }}>
              {this.state.componentStack}
            </pre>
          )}
          <button onClick={this.handleReset}>Try again</button>
        </div>
      )
    }

    return this.props.children
  }
}
