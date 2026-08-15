/**
 * The one error type handlers should throw. The error middleware turns it into
 * the `{ error: { code, message, details } }` body defined by `apiErrorSchema`
 * in `@repo/validation/common` — keep that shape stable, the frontends parse it.
 */
export class HttpError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: unknown

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.code = code
    this.details = details
  }

  static badRequest(message: string, details?: unknown) {
    return new HttpError(400, 'BAD_REQUEST', message, details)
  }

  static unauthorized(message = 'Not authenticated') {
    return new HttpError(401, 'UNAUTHENTICATED', message)
  }

  static forbidden(message = 'You do not have access to this resource') {
    return new HttpError(403, 'FORBIDDEN', message)
  }

  static notFound(message = 'Not found') {
    return new HttpError(404, 'NOT_FOUND', message)
  }

  static conflict(message: string) {
    return new HttpError(409, 'CONFLICT', message)
  }

  static tooManyRequests(message = 'Too many requests') {
    return new HttpError(429, 'RATE_LIMITED', message)
  }
}
