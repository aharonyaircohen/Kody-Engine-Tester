// Middleware barrel exports
export { createAuthMiddleware } from './auth-middleware'
export type { AuthContext } from './auth-middleware'

export { createRateLimiterMiddleware, SlidingWindowRateLimiter, byIp, byApiKey } from './rate-limiter'
export type { RateLimiterConfig, RateLimitResult, RateLimiterMiddlewareConfig } from './rate-limiter'

export {
  createRequestValidator,
  validateSchema,
  registerSchemaDefinition,
  clearGlobalDefinitions,
  JSONSchemaValidator,
} from './request-validator'
export type {
  JSONSchema,
  ValidationError,
  ValidationResult,
  ErrorFormatter,
  RequestValidatorConfig,
  RequestValidationContext,
} from './request-validator'

export { createMiddlewarePipeline, createPipelineAuthMiddleware, createPipelineRoleGuard, createRouteHandler, createAuthenticatedRoute, createEditorRoute, createAdminRoute, createPublicRoute } from './pipeline'
export type { PipelineContext, PipelineMiddleware, PipelineHandler, AuthenticatedPipelineHandler } from './pipeline'

export { createCsrfMiddleware } from './csrf-middleware'

export { createRequestLoggerMiddleware } from './requestLogger'

export { requireRole } from './role-guard'
export type { RoleError } from './role-guard'
