import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { createErrorHandler, notFoundHandler } from '@repo/http/error-middleware'
import { connectToDatabase } from '@repo/models/db'
import { modules } from './modules'

/**
 * LOCKED FILE — Team 01 (Core Platform).
 *
 * You should never need to edit this to add a feature. Register your module in
 * `src/modules.ts` instead — one line, alphabetical. That is deliberate: with 13
 * teams shipping at once, a file everybody edits is a file everybody conflicts in.
 */
export function createApp() {
  const app = express()

  // Vercel terminates TLS upstream; without this, rate limiting sees one IP.
  app.set('trust proxy', 1)

  app.use(helmet())
  app.use(
    cors({
      origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000').split(',').map((o) => o.trim()),
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '1mb' }))
  app.use(cookieParser())

  // Connect (or reuse the cached connection) before any handler touches a model.
  app.use((_req, _res, next) => {
    connectToDatabase().then(() => next(), next)
  })

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'api-student', time: new Date().toISOString() })
  })

  for (const mod of modules) {
    app.use(mod.basePath, mod.router)
  }

  app.use(notFoundHandler)
  app.use(createErrorHandler('api-student'))

  return app
}
