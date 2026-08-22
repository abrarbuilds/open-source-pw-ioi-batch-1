import { RefreshToken } from '@repo/models/refresh-token'
import type { Role } from '@repo/validation/enums'
import {
  generateRefreshToken,
  hashRefreshToken,
  refreshTokenExpiry,
  signAccessToken,
} from './jwt'
import { AuthError } from './middleware'

/**
 * LOCKED FILE — Team 03 (Auth & Identity) + a maintainer review.
 *
 * Session issuance and rotation live here, shared by `api-student` and
 * `api-admin`. The two APIs differ in *who may log in*, not in how tokens are
 * minted — so only the role check is duplicated, never the crypto.
 */

export interface SessionUser {
  _id: { toString(): string }
  role: Role
  batchId: { toString(): string } | null
}

export interface IssuedSession {
  accessToken: string
  refreshToken: string
}

export async function issueSession(user: SessionUser): Promise<IssuedSession> {
  const accessToken = signAccessToken({
    sub: user._id.toString(),
    role: user.role,
    batchId: user.batchId ? user.batchId.toString() : null,
  })

  const refreshToken = generateRefreshToken()
  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt: refreshTokenExpiry(),
  })

  return { accessToken, refreshToken }
}

/**
 * Validates a refresh token and immediately revokes it. Returns the user id it
 * belonged to. A token presented twice fails the second time — which is how a
 * stolen token gets noticed.
 */
export async function consumeRefreshToken(rawToken: string): Promise<string> {
  const expired = new AuthError(401, 'SESSION_EXPIRED', 'Session expired, please sign in again')

  const stored = await RefreshToken.findOne({ tokenHash: hashRefreshToken(rawToken) })
  if (!stored || stored.revokedAt || stored.expiresAt.getTime() < Date.now()) throw expired

  stored.revokedAt = new Date()
  await stored.save()

  return stored.userId.toString()
}

export async function revokeRefreshToken(rawToken: string): Promise<void> {
  await RefreshToken.updateOne(
    { tokenHash: hashRefreshToken(rawToken), revokedAt: null },
    { $set: { revokedAt: new Date() } },
  )
}

/** Revokes every live session for a user — used when an admin deactivates them. */
export async function revokeAllSessionsForUser(userId: string): Promise<void> {
  await RefreshToken.updateOne(
    { userId, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  )
}
