# Documentation

## Start here, in this order

| #   | Doc                                                | Why                                                                                                                                         |
| --- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **[onboarding.md](onboarding.md)**                 | Get it running locally. ~15 minutes, needs only Node and Git.                                                                               |
| 2   | **[how-we-work.md](how-we-work.md)**               | The thinking behind the repo, and how a weekend actually runs. **Read this properly** — most other rules stop looking arbitrary afterwards. |
| 3   | **[first-contribution.md](first-contribution.md)** | Issue → branch → PR → merged, step by step.                                                                                                 |
| 4   | **[teams.md](teams.md)**                           | Which folders your team owns, and the four cross-team agreements.                                                                           |

Then, when you need them:

| Doc                                                          | For                                                                          |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| **[recipes/build-a-feature.md](recipes/build-a-feature.md)** | A full vertical worked through — contract, model, API, screen, tests         |
| **[code-review.md](code-review.md)**                         | How to review, and how to be reviewed. You'll review more PRs than you write |
| **[architecture.md](architecture.md)**                       | How the four apps fit together, and why it's shaped this way                 |
| **[deployment.md](deployment.md)**                           | Vercel projects, environment variables, the cross-domain cookie trap         |
| **[adr/](adr/)**                                             | Decision records — the reasoning behind choices that look odd from outside   |

At the repo root: **[CONTRIBUTING.md](../CONTRIBUTING.md)** (conventions and
locked files), **[SECURITY.md](../SECURITY.md)**,
**[CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md)**.

---

## The five-minute version

If you read nothing else:

1. **Your team owns a vertical** — model, API module, schema, screens. You should
   almost never edit a file another team owns.
2. **Nobody waits for anybody.** `npm run seed` gives you real data on day one,
   and if you need another team's data you read their _model_, never their
   endpoint.
3. **The Zod schema comes first**, before either half of your team writes
   implementation code. It's what lets two people build in parallel.
4. **Small PRs, merged the same weekend.** Under ~400 lines. Open a draft early.
5. **Every endpoint gets three tests** — happy path, auth required, and one way
   it can be abused. The third is the one that finds real bugs.
6. **Ask after an hour of being stuck.** Not a day. Comment on the issue.

---

## Local setup, condensed

```bash
npm install
cp .env.example .env      # fill in the two JWT secrets
npm run db:local          # terminal 1 — leave running
npm run seed              # terminal 2
npm run dev
```

<http://localhost:3000> · `student01@college.edu` / `password123`

You need **no accounts** — the database, file storage, email and AI assistant
all have local drivers. Real services are used only in deployed environments.
