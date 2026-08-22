import bcrypt from 'bcryptjs'

/**
 * LOCKED FILE — Team 03 (Auth & Identity) + a maintainer review.
 *
 * Cost 10 is a deliberate choice: bcrypt is intentionally slow, and on a
 * serverless function a higher cost eats into the request timeout. Do not lower it.
 */
const BCRYPT_COST = 10

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}
