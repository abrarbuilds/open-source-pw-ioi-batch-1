import type { NextFunction, Request, Response } from 'express'
import type { ZodTypeAny, z } from 'zod'
import { HttpError } from './http-error'

type Source = 'body' | 'query' | 'params'

/**
 * Parses and *replaces* `req[source]` with the validated, coerced value. After
 * this middleware runs, the handler can trust its input completely.
 *
 * The schema must come from `@repo/validation` — that package is the contract
 * the frontend half of your team codes against, so a schema defined inline in a
 * route file is a bug.
 */
export function validate<T extends ZodTypeAny>(schema: T, source: Source = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source])

    if (!result.success) {
      return next(
        new HttpError(422, 'VALIDATION_ERROR', 'Request failed validation', result.error.flatten()),
      )
    }

    Object.defineProperty(req, source, { value: result.data as z.infer<T>, writable: true })
    return next()
  }
}
