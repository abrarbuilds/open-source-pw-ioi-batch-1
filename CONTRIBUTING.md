# Contributing

Welcome. For many of you this is a first open-source contribution, so this
document is written to be read start to finish once, then referred back to.

**Before anything else:** get the project running locally by following
[docs/onboarding.md](docs/onboarding.md).

---

## The one thing to understand

Thirteen teams commit to this repo on the same weekends. Almost every rule below
exists to answer one question: *how do 43 people work in one repository without
spending Saturday resolving merge conflicts?*

The answer is **vertical slices**. Your team owns a folder at every layer —
model, API module, validation schema, frontend feature folder — and works inside
those folders. See [docs/teams.md](docs/teams.md) for which ones are yours.

---

## Locked files

Some files are shared by everyone, so they cannot be edited casually. These are
enforced by [`.github/CODEOWNERS`](.github/CODEOWNERS): a PR touching them needs
a lead's review.

| File | Owner | If you need a change |
|---|---|---|
| `package.json`, `package-lock.json` | Team 01 | Open a **dependency request** issue |
| `turbo.json`, `.github/` | Team 01 | Issue for Team 01 |
| `apps/api-*/src/app.ts` | Team 01 | You almost certainly do not — see below |
| `apps/api-admin/src/app.ts` and `app.test.ts` | Team 03 + maintainer | Never weaken the role gate |
| `packages/auth/**` | Team 03 + maintainer | Issue, then a reviewed PR |
| `packages/models/src/db.ts` | Team 01 | Issue for Team 01 |
| `packages/ui/**`, `theme.css` | Team 02 | Issue for Team 02 |
| Root `layout.tsx`, dashboard `layout.tsx` | Team 02 | Issue for Team 02 |

**Dependencies are frozen after week 1.** Every new package changes two files
all thirteen teams share. Team 01 batches approved requests into one PR each
week. Before requesting, check whether `@repo/ui` already has what you need.

---

## Append-only registries

Three files are shared but *designed* to be edited by everyone, because each team
adds exactly one line and git merges non-adjacent line additions cleanly:

- `apps/api-student/src/modules.ts` and `apps/api-admin/src/modules.ts`
- `apps/web-*/components/nav/items/registry.ts`
- `scripts/seed/index.ts`

Add your line **in alphabetical order**. Do not reorder, regroup, or reformat
other teams' lines — that turns a clean merge into a conflict for someone else.

---

## Adding a backend feature

Copy `apps/api-student/src/modules/auth/` — it is the reference vertical.

```
modules/materials/
  materials.module.ts       exports { basePath, router }
  materials.routes.ts       routing + middleware only
  materials.controller.ts   reads req, calls service, sends res
  materials.service.ts      all the logic; never touches req/res
  materials.test.ts
```

Then add one line to `src/modules.ts`. You should never need to edit `app.ts`.

Rules that apply to every module:

- Wrap async handlers in `asyncHandler` (`@repo/http/async-handler`) — Express 4
  silently hangs on an unhandled promise rejection.
- Validate input with `validate(schema)` (`@repo/http/validate`). After it runs,
  trust `req.body`.
- Throw `HttpError` (`@repo/http/http-error`). Do not send error responses
  yourself; the error middleware owns that shape.
- Read the caller's identity from `currentUser(req)` **only** — never from the
  body, a query param, or a header.
- Schemas live in `packages/validation/src/<feature>.ts`, never inline in a
  route file. That file is the contract the frontend half of your team is
  already coding against.

## Adding a frontend feature

```
apps/web-student/
  app/(dashboard)/materials/page.tsx    thin — composes the feature
  features/materials/
    components/   hooks/   api.ts
```

- Never call `fetch` directly — use `api` from `@/lib/api-client`.
- Types come from `@repo/validation/<feature>`.
- Every list renders **three** states: loading (`Skeleton`), empty
  (`EmptyState`), data. A blank screen is indistinguishable from a bug.
- Add a nav entry only when the route actually exists.

## Adding a model

One file per model in `packages/models/src/`. Register it with `defineModel()`,
never `mongoose.model()` directly. **No barrel file** — import subpaths:
`import { Material } from '@repo/models/material'`.

---

## Git workflow

**Branches:** `t<NN>/<short-description>` — e.g. `t06/attendance-percentage`.
The team number makes ownership obvious in a list of forty branches.

**Commits:** conventional commits — `feat(attendance): add percentage endpoint`,
`fix(auth): reject rotated refresh tokens`.

**Pull requests:**

- One issue, one PR, one person.
- **Under ~400 lines.** Bigger PRs sit unreviewed for a week, which blocks you
  and everyone downstream. Split them.
- Fill in the template honestly. "How I tested it" means what you actually ran,
  not "it works".
- Needs one peer review from your team plus one lead review.
- `main` is protected: squash merge, linear history, CI green. The merge queue
  handles keeping your branch up to date — do not rebase everything by hand.

**Before you open a PR:**

```bash
npm run lint
npm run typecheck
npm run test
```

---

## Testing

Every endpoint needs three tests: the happy path, the auth requirement, and one
way it can be abused. `apps/api-student/src/modules/auth/auth.test.ts` shows the
shape — including why the "wrong password" and "unknown email" errors must be
identical.

Tests run against a real MongoDB in memory, not mocks. Mocked Mongoose lies
about indexes, validation and aggregation — exactly the things that break in
production.

---

## Finding work

Issues are labelled `team:NN`, `area:*` and `difficulty:*`. Start with
[`good first issue`](../../labels/good%20first%20issue) filtered to your team.

Comment on an issue to claim it before you start, so two people do not build the
same thing. If you get stuck for more than an hour, say so in the issue — asking
early is not a failure, and it is much cheaper than a week of silence.

## Code of conduct

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md). It is
short; read it.

## Security

Found a vulnerability? Do **not** open a public issue. See
[SECURITY.md](SECURITY.md).
