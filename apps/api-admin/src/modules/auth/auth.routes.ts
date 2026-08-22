import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { requireAuth } from '@repo/auth/middleware'
import { asyncHandler } from '@repo/http/async-handler'
import { validate } from '@repo/http/validate'
import { loginSchema } from '@repo/validation/auth'
import * as controller from './auth.controller'

/** Owner: Team 03 — Auth & Identity. */

// Tighter than the student portal: these credentials are worth more.
const credentialsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many attempts, try again later' } },
})

export const authRouter: Router = Router()

authRouter.post('/login', credentialsLimiter, validate(loginSchema), asyncHandler(controller.login))
authRouter.post('/refresh', asyncHandler(controller.refresh))
authRouter.post('/logout', asyncHandler(controller.logout))
authRouter.get('/me', requireAuth, asyncHandler(controller.me))
