import { createHash, randomBytes } from 'node:crypto'
import jwt from 'jsonwebtoken'
import type { Role } from '@repo/validation/enums'

/**
 * LOCKED FILE — Team 03 (Auth & Identity) + a maintainer review.
 *
 * Two different kinds of token, on purpose:
 *
 *   Access token  — a short-lived signed JWT sent as `Authorization: Bearer`.
 *                   Stateless: any API can verify it without a database round trip.
 *   Refresh token — a long-lived random string in an httpOnly cookie. We store
 *                   only its SHA-256 hash, so a database leak cannot be replayed,
 *                   and we can revoke it. See `@repo/models/refresh-token`.
 */

export const ACCESS_TOKEN_TTL = '15m'
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

export interface AccessTokenPayload {
  sub: string
  role: Role
  batchId: string | null
}

function requireSecret(name: 'JWT_ACCESS_SECRET' | 'JWT_REFRESH_SECRET'): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set. Copy .env.example to .env and fill it in.`)
  return value
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, requireSecret('JWT_ACCESS_SECRET'), { expiresIn: ACCESS_TOKEN_TTL })
}

/** Throws if the token is expired, tampered with, or signed by another key. */
export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, requireSecret('JWT_ACCESS_SECRET'))
  if (typeof decoded === 'string') throw new Error('Malformed token payload')
  return decoded as AccessTokenPayload & { iat: number; exp: number }
}

/** Opaque random token — never a JWT, because we want it revocable. */
export function generateRefreshToken(): string {
  return randomBytes(48).toString('base64url')
}

export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function refreshTokenExpiry(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_MS)
}
