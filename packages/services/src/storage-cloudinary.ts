import { createHash, randomUUID } from 'node:crypto'
import { slugifyFilename, type StorageDriver, type UploadTicket } from './storage'

/**
 * LOCKED FILE — Team 01 (Core Platform) + a maintainer review.
 *
 * Signed direct-to-Cloudinary uploads. The browser sends the file straight to
 * Cloudinary; the bytes never pass through our API.
 *
 * `CLOUDINARY_API_SECRET` is used here to sign the upload and **must never
 * leave the server**. It is not returned in the ticket — only the signature
 * derived from it is, and a signature is single-use and scoped to those exact
 * parameters.
 */

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `${name} is not set. Either set the Cloudinary credentials or use STORAGE_DRIVER=local.`,
    )
  }
  return value
}

/**
 * Cloudinary's signing scheme: sort the params by key, join them as
 * `k=v&k=v`, append the API secret, and SHA-1 the result.
 */
function sign(params: Record<string, string>, apiSecret: string): string {
  const canonical = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')
  return createHash('sha1').update(canonical + apiSecret).digest('hex')
}

export function createCloudinaryStorage(): StorageDriver {
  const cloudName = required('CLOUDINARY_CLOUD_NAME')
  const apiKey = required('CLOUDINARY_API_KEY')
  const apiSecret = required('CLOUDINARY_API_SECRET')

  return {
    name: 'cloudinary',

    async createUploadTicket({ folder, filename }) {
      const publicId = `${randomUUID()}-${slugifyFilename(filename)}`
      const timestamp = Math.floor(Date.now() / 1000).toString()

      // Only the signed params may be sent — Cloudinary rejects the upload if
      // the client adds anything that was not part of the signature.
      const signed = { folder, public_id: publicId, timestamp }

      const ticket: UploadTicket = {
        method: 'POST',
        uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        fields: {
          ...signed,
          api_key: apiKey,
          signature: sign(signed, apiSecret),
        },
        key: `${folder}/${publicId}`,
      }
      return ticket
    },

    urlFor(key) {
      return `https://res.cloudinary.com/${cloudName}/auto/upload/${key}`
    },

    async remove(key) {
      const timestamp = Math.floor(Date.now() / 1000).toString()
      const signed = { public_id: key, timestamp }

      const body = new URLSearchParams({
        ...signed,
        api_key: apiKey,
        signature: sign(signed, apiSecret),
      })

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/destroy`, {
        method: 'POST',
        body,
      })

      if (!res.ok) {
        throw new Error(`Cloudinary delete failed (${res.status})`)
      }
    },
  }
}
