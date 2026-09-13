import { randomBytes, createHash } from 'node:crypto'
import { getDb, getSupabaseAdmin } from '@repo/models/db'
import { authTokens, profiles } from '@repo/models/schema'
import { eq, and } from 'drizzle-orm'

/**
 * Generates a cryptographically random token and its SHA-256 hash.
 */
function generateToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString('hex')
  const hash = createHash('sha256').update(token).digest('hex')
  return { token, hash }
}

/**
 * Initiates a password reset for the given email.
 * Generates a single-use token, stores its hash, and triggers the email.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const db = getDb()

  // 1. Find user by email
  const userRecord = await db.query.profiles.findFirst({
    where: eq(profiles.email, email.toLowerCase()),
  })

  // Security rule: Do not throw if user is not found, to prevent email enumeration
  if (!userRecord) return

  // 2. Generate token and hash
  const { token, hash } = generateToken()

  // 3. Store hash in DB with 1 hour expiry
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

  await db.insert(authTokens).values({
    userId: userRecord.id,
    type: 'PASSWORD_RESET',
    tokenHash: hash,
    expiresAt,
  })

  // 4. Call Team 08's email service (Mocked for now until they build it)
  // await sendResetEmail(userRecord.email, token)
  console.log(`[MOCK EMAIL] Reset token for ${email}: ${token}`)
}

/**
 * Confirms a password reset using the token from the email.
 * Verifies the token, updates the password in Supabase, and revokes all sessions.
 */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const db = getDb()
  const supabase = getSupabaseAdmin()
  const tokenHash = createHash('sha256').update(token).digest('hex')

  // 1. Find the token in the DB
  const tokenRecord = await db.query.authTokens.findFirst({
    where: and(eq(authTokens.tokenHash, tokenHash), eq(authTokens.type, 'PASSWORD_RESET')),
  })

  if (!tokenRecord) {
    throw new Error('Invalid or expired reset token')
  }

  // 2. Check expiry
  if (new Date() > tokenRecord.expiresAt) {
    // Delete expired token to clean up
    await db.delete(authTokens).where(eq(authTokens.id, tokenRecord.id))
    throw new Error('Invalid or expired reset token')
  }

  // 3. Update password in Supabase Auth (Supabase handles the hashing internally)
  const { error } = await supabase.auth.admin.updateUserById(tokenRecord.userId, {
    password: newPassword,
  })

  if (error) {
    throw new Error('Failed to update password')
  }

  // 4. Delete the used reset token (Single-use rule)
  await db.delete(authTokens).where(eq(authTokens.id, tokenRecord.id))

  // 5. Revoke all other sessions (e.g., delete refresh tokens)
  await db
    .delete(authTokens)
    .where(and(eq(authTokens.userId, tokenRecord.userId), eq(authTokens.type, 'REFRESH')))
}

/**
 * Changes the password for an already authenticated user.
 * Verifies the old password by attempting a Supabase login.
 */
export async function changePassword(
  userId: string,
  email: string,
  oldPassword: string,
  newPassword: string,
): Promise<void> {
  const db = getDb()
  const supabase = getSupabaseAdmin()

  // 1. Verify old password using a temporary sign-in attempt
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: oldPassword,
  })

  if (signInError) {
    throw new Error('Invalid old password')
  }

  // 2. Update password in Supabase Auth
  const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword,
  })

  if (updateError) {
    throw new Error('Failed to update password')
  }

  // 3. Revoke all other sessions (this deletes all REFRESH tokens for the user)
  // Note: Depending on implementation, you might want to keep the current session.
  await db
    .delete(authTokens)
    .where(and(eq(authTokens.userId, userId), eq(authTokens.type, 'REFRESH')))
}
