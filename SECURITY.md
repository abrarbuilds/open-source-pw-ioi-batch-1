# Security policy

## Reporting a vulnerability

**Do not open a public issue.** Use GitHub's private reporting:
**Security → Advisories → Report a vulnerability**, or contact a maintainer
directly.

Include what you found, how to reproduce it, and what an attacker could do with
it. You will get a reply within a few days.

Finding a security bug in this project is a good thing, not an embarrassment for
whoever wrote it. Report it and we will fix it together.

## Where the sensitive code is

If you are looking for what to be careful with, it is these:

- `packages/auth/` — password hashing, JWT signing, refresh-token rotation
- `apps/api-admin/src/app.ts` — the role gate that separates students from admin
  functionality
- Anything handling Cloudinary signatures — a leaked signing secret lets anyone
  upload to the account
- `apps/api-student/src/modules/assistant/` — the assistant must never be able to
  read a student's data other than the caller's own

All of these require a maintainer's review to change. That is not distrust; it
is that a mistake there is much more expensive than a mistake elsewhere.

## Rules that are not negotiable

1. **Secrets never reach the browser.** `CLOUDINARY_API_SECRET` and
   `ANTHROPIC_API_KEY` are set on the APIs only. Never prefix a secret with
   `NEXT_PUBLIC_`.
2. **Identity comes from the token.** `currentUser(req)` is the only trustworthy
   source of who is calling. Never read a user id from a request body, query
   param, or header — including in AI tool handlers.
3. **Never commit `.env`.** It is gitignored. If you commit a secret by
   accident, tell a maintainer immediately — the secret must be rotated, and
   deleting the commit is not enough.
4. **Auth errors stay vague.** "Email or password is incorrect" for every login
   failure. A more helpful message tells an attacker which emails have accounts.
5. **Every endpoint gets a wrong-role test.** Not just "does it work signed in",
   but "does it correctly refuse the wrong person".

## Supported versions

This is a teaching project under active development. Only `main` is supported.
