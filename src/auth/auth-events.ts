import { EventEmitter } from '@/utils/event-emitter'

export interface LoginEvent {
  userId: string
  email: string
  role: string
  ipAddress: string
  userAgent: string
  timestamp: Date
}

export interface LogoutEvent {
  userId: string
  timestamp: Date
}

export interface TokenRefreshEvent {
  userId: string
  email: string
  role: string
  timestamp: Date
}

export type AuthEvents = {
  login: [LoginEvent]
  logout: [LogoutEvent]
  tokenRefresh: [TokenRefreshEvent]
}

export function createAuthEventEmitter(): EventEmitter<AuthEvents> {
  return new EventEmitter<AuthEvents>()
}