import type { NextFunction, Request, Response } from 'express'
import { HttpError } from './http-error'

/**
 * LOCKED — Team 01 (Core Platform).
 *
 * Every failure leaves the API through here, in the shape `apiErrorSchema`
 * describes. Never send a raw stack trace: it leaks file paths and dependency
 * versions to anyone poking at production.
 */

interface StatusfulError {
  status?: number
  code?: string
  message?: string
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: `No route for ${req.method} ${req.path}` },
  })
}

export function createErrorHandler(serviceName: string) {
  return (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    // `AuthError` from @repo/auth also carries `status` and `code`.
    const candidate = err as StatusfulError
    const status = typeof candidate?.status === 'number' ? candidate.status : 500
    const code = candidate?.code ?? 'INTERNAL_ERROR'

    if (status >= 500) {
      // eslint-disable-next-line no-console
      console.error(`[${serviceName}] unhandled error`, err)
    }

    res.status(status).json({
      error: {
        code,
        message:
          status >= 500
            ? 'Something went wrong on our side'
            : (candidate?.message ?? 'Request failed'),
        ...(err instanceof HttpError && err.details !== undefined ? { details: err.details } : {}),
      },
    })
  }
}
