import type { NextFunction, Request, RequestHandler, Response } from 'express'

/**
 * Express 4 does not catch rejected promises from async handlers — the request
 * just hangs until it times out. Wrap every async handler in this.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next)
  }
}
