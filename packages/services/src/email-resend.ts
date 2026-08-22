import type { EmailDriver } from './email'

/**
 * LOCKED FILE — Team 01 (Core Platform).
 *
 * Resend's REST API is a single POST, so there is no SDK dependency here.
 */
export function createResendEmail(): EmailDriver {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM

  if (!apiKey || !from) {
    throw new Error(
      'RESEND_API_KEY and EMAIL_FROM must both be set when EMAIL_DRIVER=resend. ' +
        'Use EMAIL_DRIVER=console locally.',
    )
  }

  return {
    name: 'resend',
    async send({ to, subject, text }) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, to: [to], subject, text }),
      })

      if (!res.ok) {
        // Never log the response body verbatim — provider errors sometimes echo
        // request headers back.
        throw new Error(`Email send failed (${res.status})`)
      }
    },
  }
}
