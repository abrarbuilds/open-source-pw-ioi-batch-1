import { verifyPassword } from '@repo/auth/password'
import { consumeRefreshToken, issueSession, revokeRefreshToken } from '@repo/auth/session'
import { HttpError } from '@repo/http/http-error'
import { User, type UserDoc } from '@repo/models/user'
import type { LoginInput, PublicUser } from '@repo/validation/auth'
import { ADMIN_PORTAL_ROLES } from '@repo/validation/enums'

/**
 * Owner: Team 03 — Auth & Identity.
 *
 * Deliberately smaller than the student one: there is **no self-registration**
 * here. Admin and faculty accounts are created by an existing admin through
 * Team 11's user-management screens, so there is no public path to a privileged
 * account.
 */

function toPublicUser(user: UserDoc): PublicUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    batchId: user.batchId ? user.batchId.toString() : null,
    avatarUrl: user.avatarUrl,
  }
}

function assertCanUseAdminPortal(user: UserDoc) {
  if (!ADMIN_PORTAL_ROLES.includes(user.role)) {
    // Same message as a bad password: a student probing this endpoint should not
    // learn that their credentials were correct but their role was not.
    throw HttpError.unauthorized('Email or password is incorrect')
  }
}

export async function loginAdmin(input: LoginInput) {
  const user = await User.findOne({ email: input.email }).select('+passwordHash')

  const invalid = HttpError.unauthorized('Email or password is incorrect')
  if (!user || !user.isActive) throw invalid
  if (!(await verifyPassword(input.password, user.passwordHash))) throw invalid
  assertCanUseAdminPortal(user)

  return { user: toPublicUser(user), ...(await issueSession(user)) }
}

export async function refreshAdminSession(rawToken: string) {
  const userId = await consumeRefreshToken(rawToken)

  const user = await User.findById(userId)
  if (!user || !user.isActive) {
    throw HttpError.unauthorized('Session expired, please sign in again')
  }
  // Re-checked on every refresh: an admin demoted to STUDENT loses the portal at
  // the next rotation rather than at the end of their 7-day refresh window.
  assertCanUseAdminPortal(user)

  return { user: toPublicUser(user), ...(await issueSession(user)) }
}

export async function endAdminSession(rawToken: string) {
  await revokeRefreshToken(rawToken)
}

export async function getAdminById(id: string) {
  const user = await User.findById(id)
  if (!user || !user.isActive) throw HttpError.notFound('User not found')
  return toPublicUser(user)
}
