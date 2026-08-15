# Onboarding — get it running in 15 minutes

This is the first thing you should do. If any step here fails, say so in
Discussions rather than pushing through — a broken local setup is the single
biggest reason first-time contributors give up.

## What you need

- **Node 20 or newer** — check with `node -v`. Install via [nvm](https://github.com/nvm-sh/nvm).
- **npm 10 or newer** — comes with Node.
- **Git**, and a GitHub account added to the repo by a lead.

**That is the whole list.** You do not need a MongoDB Atlas account, a
Cloudinary account, an Anthropic API key, or an email provider. Everything
external has a local driver:

| Service | Local default | What it does |
|---|---|---|
| Database | `npm run db:local` | Runs a real MongoDB on your machine |
| File storage | `STORAGE_DRIVER=local` | Writes uploads to `.local-uploads/` |
| Email | `EMAIL_DRIVER=console` | Prints the email (and reset links) to your terminal |
| AI assistant | `AI_DRIVER=stub` | Deterministic canned replies and tool calls |

The real services are only used in deployed environments, where the maintainers
hold the credentials. You never need an account to build your feature.

## 1. Clone and install

```bash
git clone <this repo>
cd open-source-pw-ioi-batch-1
npm install
```

One `npm install` at the root covers all four apps and every shared package —
that is what the workspace setup buys us. Never run `npm install` inside
`apps/` or `packages/`.

## 2. Get a database

### Option A — the bundled local database (recommended)

```bash
npm run db:local
```

Leave it running in its own terminal. It downloads a real MongoDB binary the
first time (~90MB) and stores data in `.local-db/`, so your data survives
restarts. It prints the connection string to put in `.env`.

### Option B — MongoDB Atlas

1. Sign up at <https://www.mongodb.com/cloud/atlas> and create a **free M0**
   cluster.
2. **Database Access** → add a user with a password you will remember.
3. **Network Access** → add IP `0.0.0.0/0`. This is fine for a dev cluster with
   throwaway data; never do it for anything real.
4. **Connect → Drivers** → copy the connection string.

Name the database `tracker_dev` in the URI:

```
mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/tracker_dev?retryWrites=true&w=majority
```

### Option C — Docker

```bash
docker run -d -p 27017:27017 --name tracker-mongo mongo:7
```

Then use `mongodb://localhost:27017/tracker_dev`.

## 3. Configure the environment

```bash
cp .env.example .env
```

Open `.env` and set three things:

```bash
MONGODB_URI=<your connection string from step 2>

# Generate each of these separately — they must be different from each other:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_ACCESS_SECRET=<paste the first one>
JWT_REFRESH_SECRET=<paste the second one>
```

`.env` is gitignored. If you ever find yourself about to commit it, stop.

## 4. Seed and run

```bash
npm run seed
npm run dev
```

`npm run seed` **wipes the database it connects to** and loads one batch, six
subjects, three faculty, forty students and five weeks of class sessions. It
refuses to run against anything with `prod` in the connection string.

`npm run dev` starts all four apps at once:

| App | URL |
|---|---|
| Student portal | <http://localhost:3000> |
| Admin portal | <http://localhost:3001> |
| Student API | <http://localhost:4000/api/health> |
| Admin API | <http://localhost:4001/api/health> |

## 5. Check it actually works

1. Open <http://localhost:3000>, sign in as `student01@college.edu` /
   `password123`. You should land on the dashboard.
2. Open <http://localhost:3001>, sign in as `admin@college.edu` / `password123`.
3. Now try signing in to the **admin** portal with the **student** account. It
   must fail with "Email or password is incorrect" — if it succeeds, something
   is badly wrong, and that is worth an issue immediately.

## 6. Run the checks you will need before every PR

```bash
npm run lint
npm run typecheck
npm run test
```

The first `npm run test` is slow — `mongodb-memory-server` downloads a real
MongoDB binary. Later runs are quick.

## Common problems

**`MONGODB_URI is not set`** — you have a `.env.example` but no `.env`, or you
are running a command from inside `apps/` instead of the repo root.

**`MongoServerError: bad auth`** — the password in your connection string needs
URL-encoding if it contains `@`, `:`, `/` or `%`.

**Port already in use** — something else is on 3000/3001/4000/4001. Find it with
`lsof -i :3000` and stop it.

**Changes to `packages/*` do not show up** — the shared packages compile to
`dist/`. `npm run dev` watches them, but if you started an app on its own, run
`npm run build` at the root first.

**`Cannot find module '@repo/...'`** — run `npm install` at the repo root, then
`npm run build`.

## Next

- [docs/architecture.md](architecture.md) — how the pieces fit together
- [docs/teams.md](teams.md) — which folders your team owns
- [CONTRIBUTING.md](../CONTRIBUTING.md) — the conventions, and which files are locked
