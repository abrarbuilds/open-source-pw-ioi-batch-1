import { hashPassword, verifyPassword } from '@repo/auth/password'
import { consumeRefreshToken, issueSession, revokeRefreshToken } from '@repo/auth/session'
import { HttpError } from '@repo/http/http-error'
import { User, type UserDoc } from '@repo/models/user'
import type { LoginInput, PublicUser, RegisterInput } from '@repo/validation/auth'

/**
 * Owner: Team 03 — Auth & Identity.
 *
 * This module is the reference vertical: every other feature module in this repo
 * should look like it — routes → controller → service, with the service holding
 * all the logic and never touching `req`/`res`.
 */

export function toPublicUser(user: UserDoc): PublicUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    batchId: user.batchId ? user.batchId.toString() : null,
    avatarUrl: user.avatarUrl,
  }
}

export async function registerUser(input: RegisterInput) {
  const existing = await User.findOne({ email: input.email }).lean()
  if (existing) {
    throw HttpError.conflict('An account with this email already exists')
  }

  const user = await User.create({
    name: input.name,
    email: input.email,
    passwordHash: await hashPassword(input.password),
    role: 'STUDENT',
  })

  return { user: toPublicUser(user), ...(await issueSession(user)) }
}

export async function loginUser(input: LoginInput) {
  const user = await User.findOne({ email: input.email }).select('+passwordHash')

  // Same error for "no such user" and "wrong password" — otherwise this endpoint
  // becomes a way to enumerate which emails have accounts.
  const invalid = HttpError.unauthorized('Email or password is incorrect')
  if (!user || !user.isActive) throw invalid
  if (!(await verifyPassword(input.password, user.passwordHash))) throw invalid

  return { user: toPublicUser(user), ...(await issueSession(user)) }
}

export async function refreshSession(rawToken: string) {
  const userId = await consumeRefreshToken(rawToken)

  const user = await User.findById(userId)
  if (!user || !user.isActive) {
    throw HttpError.unauthorized('Session expired, please sign in again')
  }

  return { user: toPublicUser(user), ...(await issueSession(user)) }
}

export async function endSession(rawToken: string) {
  await revokeRefreshToken(rawToken)
}

export async function getUserById(id: string) {
  const user = await User.findById(id)
  if (!user || !user.isActive) throw HttpError.notFound('User not found')
  return toPublicUser(user)
}
