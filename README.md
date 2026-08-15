# Program Tracker

An open-source program tracker for a college batch. Students find class slides,
submit assignments, check their attendance and ask an AI assistant about their
own academic data. Faculty and admins run the batch from a separate portal.

Built by ~43 students in 13 teams. If you are one of them, start with
[docs/onboarding.md](docs/onboarding.md) — you should be running the whole thing
locally in about fifteen minutes.

**Stack:** MongoDB · Express · React (Next.js) · Node — with Cloudinary for file
storage and Claude for the assistant. Everything deploys to Vercel.

---

## What is in here

```
apps/
  web-student/    Next.js — the student portal            :3000
  web-admin/      Next.js — the admin & faculty portal    :3001
  api-student/    Express — the student API               :4000
  api-admin/      Express — the admin API                 :4001
packages/
  models/         Mongoose schemas, one file per model
  validation/     Zod schemas — the contract between frontend and backend
  auth/           JWT, password hashing, session rotation, role middleware
  http/           HttpError, request validation, error middleware
  client/         The browser-side API client both frontends use
  ui/             Shared components and the design tokens
scripts/seed/     Demo data — one batch, 6 subjects, 40 students
docs/             Architecture, onboarding, deployment, team ownership
```

Two APIs rather than one is deliberate: `api-admin` mounts every route behind a
role gate, so a bug in student-facing code cannot expose admin functionality.
See [docs/adr/0001-separate-admin-api.md](docs/adr/0001-separate-admin-api.md).

## Quick start

```bash
git clone <this repo>
cd open-source-pw-ioi-batch-1
npm install

cp .env.example .env      # then fill in MONGODB_URI and the two JWT secrets
npm run seed              # wipes the dev database and loads demo data
npm run dev               # starts all four apps
```

Then open <http://localhost:3000> and sign in:

| Role | Email | Password |
|---|---|---|
| Student | `student01@college.edu` | `password123` |
| Faculty | `faculty1@college.edu` | `password123` |
| Admin | `admin@college.edu` | `password123` |

The admin portal is a separate app at <http://localhost:3001>. A student account
cannot sign in there — that is the point of it.

Full setup instructions, including getting a free MongoDB Atlas cluster, are in
[docs/onboarding.md](docs/onboarding.md).

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) first — especially the section on which
files are locked. With thirteen teams committing on the same weekend, the
conventions are what stop everyone from colliding.

Looking for something to work on? Filter issues by
[`good first issue`](../../labels/good%20first%20issue) and your `team:NN` label.

## Licence

MIT — see [LICENSE](LICENSE).
