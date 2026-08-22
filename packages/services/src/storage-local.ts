import { randomUUID } from 'node:crypto'
import { createReadStream, existsSync } from 'node:fs'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join, normalize, resolve, sep } from 'node:path'
import express, { Router, type Request, type Response } from 'express'
import { HttpError } from '@repo/http/http-error'
import { slugifyFilename, type StorageDriver, type UploadTicket } from './storage'

/**
 * LOCKED FILE — Team 01 (Core Platform).
 *
 * The zero-setup storage driver. Files land in `.local-uploads/` (gitignored)
 * and are served back from this API.
 *
 * Never enable this in a deployed environment: serverless filesystems are
 * ephemeral and per-instance, so an upload would vanish or be invisible to the
 * next request.
 */

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024

/**
 * Note the truthiness checks rather than `??` — an env var set to the empty
 * string (which is what an unfilled `KEY=` line in `.env` produces) is not
 * nullish, so `??` would happily use `""` and resolve to the wrong directory.
 */
function storageRoot(): string {
  const configured = process.env.LOCAL_STORAGE_DIR
  if (configured) return resolve(configured)

  // Deliberately relative to this package, not to `process.cwd()`: turbo runs
  // each app with its own directory as the cwd, which would scatter uploads
  // across `apps/*/` instead of collecting them at the repo root.
  return resolve(__dirname, '../../..', '.local-uploads')
}

function publicApiUrl(): string {
  return process.env.PUBLIC_API_URL || 'http://localhost:4000'
}

/**
 * Resolves a storage key to an absolute path, refusing anything that escapes
 * the storage root. The key reaches us from the browser, so `../../.env` is a
 * request we will actually receive one day.
 */
function resolveKey(key: string): string {
  const root = storageRoot()
  const target = resolve(root, normalize(key))
  if (target !== root && !target.startsWith(root + sep)) {
    throw HttpError.badRequest('Invalid storage key')
  }
  return target
}

export function createLocalStorage(): StorageDriver {
  return {
    name: 'local',

    async createUploadTicket({ folder, filename }) {
      const key = `${folder}/${randomUUID()}-${slugifyFilename(filename)}`
      const ticket: UploadTicket = {
        method: 'PUT',
        uploadUrl: `${publicApiUrl()}/api/uploads/${key}`,
        fields: {},
        key,
      }
      return ticket
    },

    urlFor(key) {
      return `${publicApiUrl()}/api/uploads/${key}`
    },

    async remove(key) {
      await rm(resolveKey(key), { force: true })
    },
  }
}

/**
 * Mounted at `/api/uploads` by both APIs when STORAGE_DRIVER=local.
 *
 * PUT stores the raw request body; GET serves it back. This mirrors the shape
 * of a presigned upload, so the client-side code is identical under either
 * driver.
 */
export function createLocalUploadRouter(): Router {
  const router: Router = Router()

  router.put(
    '/*',
    express.raw({ type: '*/*', limit: MAX_UPLOAD_BYTES }),
    async (req: Request, res: Response) => {
      const key = decodeURIComponent(req.params[0] ?? '')
      if (!key) throw HttpError.badRequest('Missing storage key')

      const body = req.body as Buffer
      if (!Buffer.isBuffer(body) || body.length === 0) {
        throw HttpError.badRequest('Empty upload body')
      }

      const target = resolveKey(key)
      await mkdir(dirname(target), { recursive: true })
      await writeFile(target, body)

      res.status(201).json({ key, bytes: body.length })
    },
  )

  router.get('/*', (req: Request, res: Response) => {
    const key = decodeURIComponent(req.params[0] ?? '')
    const target = resolveKey(key)

    if (!existsSync(target)) throw HttpError.notFound('File not found')

    // Never let a stored file be interpreted as a script by the browser.
    res.setHeader('Content-Type', 'application/octet-stream')
    res.setHeader('Content-Disposition', 'attachment')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    createReadStream(target).pipe(res)
  })

  return router
}
