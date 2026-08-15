/**
 * LOCKED FILE — Team 01 (Core Platform).
 *
 * Email, behind one interface with two drivers:
 *
 *   EMAIL_DRIVER=console   prints the message to the terminal. The default.
 *                          Team 03 can build the entire password-reset flow —
 *                          including clicking the link — without a provider.
 *   EMAIL_DRIVER=resend    actually sends. What the deployed environments use.
 *
 * Team 03 (password reset) and Team 08 (digest) share this. One provider, one
 * integration — do not add a second.
 */

export interface EmailMessage {
  to: string
  subject: string
  /** Plain text. Keep it plain — HTML email is a rabbit hole nobody needs here. */
  text: string
}

export interface EmailDriver {
  readonly name: 'console' | 'resend'
  send(message: EmailMessage): Promise<void>
}

let cached: EmailDriver | null = null

export function getEmail(): EmailDriver {
  if (cached) return cached

  const driver = process.env.EMAIL_DRIVER || 'console'

  if (driver === 'resend') {
    const { createResendEmail } = require('./email-resend') as typeof import('./email-resend')
    cached = createResendEmail()
  } else if (driver === 'console') {
    const { createConsoleEmail } = require('./email-console') as typeof import('./email-console')
    cached = createConsoleEmail()
  } else {
    throw new Error(`Unknown EMAIL_DRIVER "${driver}" — expected "console" or "resend".`)
  }

  return cached
}

export function resetEmail() {
  cached = null
}
