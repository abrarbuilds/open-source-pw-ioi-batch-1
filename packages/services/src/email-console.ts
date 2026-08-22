import type { EmailDriver } from './email'

/**
 * LOCKED FILE — Team 01 (Core Platform).
 *
 * Prints the email instead of sending it. Copy the reset link out of your
 * terminal and paste it into the browser — the flow works end to end with no
 * provider account.
 */
export function createConsoleEmail(): EmailDriver {
  return {
    name: 'console',
    async send({ to, subject, text }) {
      // eslint-disable-next-line no-console
      console.log(
        [
          '',
          '─'.repeat(64),
          '  EMAIL (not sent — EMAIL_DRIVER=console)',
          `  To:      ${to}`,
          `  Subject: ${subject}`,
          '─'.repeat(64),
          text,
          '─'.repeat(64),
          '',
        ].join('\n'),
      )
    },
  }
}
