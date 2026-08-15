# Your first contribution

A walkthrough from picking an issue to seeing your name on a merged PR. If this
is your first open-source contribution, follow it literally the first time —
after that you'll have the shape and can move faster.

Before you start, get the project running: **[onboarding.md](onboarding.md)**.

---

## 1. Pick an issue

Go to the repo's Issues tab and filter by:

- your team's label (`team:04`, `team:07`, …)
- `good first issue`

Pick one that you understand well enough to describe back in a sentence. If you
can't do that, pick a different one or ask on the issue what it means — an
unclear issue is the issue's fault, not yours.

## 2. Claim it

**Comment on the issue** saying you're taking it.

This is not bureaucracy. It's the only thing stopping two people from spending
their Saturday building the same screen. Ten seconds.

## 3. Get up to date

```bash
git checkout main
git pull
npm install          # in case dependencies changed
```

## 4. Branch

```bash
git checkout -b t04/materials-list-endpoint
```

Format: `t<team-number>/<short-description>`. The team number makes ownership
obvious when there are forty branches in the list.

## 5. Write the contract first

If your feature touches the API, the Zod schema comes before anything else:

```ts
// packages/validation/src/materials.ts
import { z } from 'zod'
import { objectIdSchema } from './common'

export const materialListQuerySchema = z.object({
  subjectId: objectIdSchema.optional(),
})

export const materialSchema = z.object({
  id: objectIdSchema,
  title: z.string(),
  type: z.enum(['PPT', 'PDF', 'DOC', 'VIDEO', 'LINK', 'OTHER']),
  url: z.string().url().nullable(),
})
export type Material = z.infer<typeof materialSchema>
```

**Merge this on its own, first.** It's a tiny PR that reviews in two minutes,
and the moment it lands the other half of your team can start building against
it in parallel. This is the difference between two people working and one person
working while the other waits.

## 6. Build it

Copy the shape of the reference vertical — `apps/api-student/src/modules/auth/`
for backend, `apps/web-student/features/` for frontend. Full worked example:
**[recipes/build-a-feature.md](recipes/build-a-feature.md)**.

Keep it small. If your change is growing past ~400 lines, stop and ask yourself
what half of it could ship on its own.

## 7. Write the tests

Three, minimum:

```ts
it('returns materials for a subject', async () => {
  /* happy path */
})
it('401s without a token', async () => {
  /* auth required */
})
it("does not leak another batch's materials", async () => {
  /* abuse case */
})
```

The third one is the one that finds real bugs. Look at
`apps/api-student/src/modules/auth/auth.test.ts` for the shape.

## 8. Check it yourself before asking anyone else to

```bash
npm run lint
npm run typecheck
npm run test
```

Then actually use it:

```bash
npm run db:local    # terminal 1, if not already running
npm run seed        # terminal 2
npm run dev
```

Sign in at <http://localhost:3000> as `student01@college.edu` / `password123`
and click through what you built. **Every reviewer can tell when this step was
skipped**, and it's the fastest way to lose their goodwill.

## 9. Commit

```bash
git add .
git commit -m "feat(materials): add list endpoint"
```

Conventional commits: `feat(area): what changed`, `fix(area): what broke`,
`docs(area): …`, `test(area): …`.

## 10. Push and open a PR

```bash
git push -u origin t04/materials-list-endpoint
```

GitHub prints a link. Open it and fill in the template honestly.

**"How I tested it" means what you actually ran.** Compare:

> ~~It works.~~

> Seeded, signed in as student01, opened `/materials?subjectId=<CS202 id>`,
> got 4 materials back — matches the 4 the seed creates for CS202. Also checked
> it 401s with no token.

The second one takes twenty seconds to write and saves the reviewer ten minutes.

**Open it as a draft if you're not finished.** A draft PR on Saturday morning is
how your team sees your direction early enough to correct it cheaply.

## 11. Handle the review

You'll get comments. This is the normal, healthy case — **comments on a PR are
not criticism of you.** Every professional engineer's code gets reviewed, every
time, forever.

- Push more commits to the same branch; the PR updates automatically.
- If you disagree, say why. Reviewers are often missing context and are
  frequently wrong. A PR is a conversation, not a verdict.
- If you don't understand a comment, ask. "Can you say more about what you'd
  expect here?" is a completely normal thing to write.

See **[code-review.md](code-review.md)** for what reviewers are looking for.

## 12. Merged

Your change is on `main` and deploys automatically. Go look at it on the live
site — that part genuinely doesn't get old.

Then delete your local branch and start the next one:

```bash
git checkout main && git pull
git branch -d t04/materials-list-endpoint
```

---

## Common first-timer snags

**"I committed to `main` by accident."**
Nothing is broken — `main` is protected, so the push was refused.

```bash
git branch my-work        # save your commits on a new branch
git reset --hard origin/main
git checkout my-work
```

**"I need to change something another team owns."**
Don't edit it. Open an issue on their team explaining what you need. If it's
blocking you today, read their model directly instead — that's allowed and
expected.

**"CI is red and I don't know why."**
Open the failing check and read the last 20 lines. It's usually a lint rule or a
type error, and the message names the file and line. If it still doesn't make
sense, paste it in your PR and ask.

**"My branch conflicts with `main`."**

```bash
git fetch origin
git rebase origin/main
# fix the conflicted files, then:
git add . && git rebase --continue
git push --force-with-lease
```

`--force-with-lease` rather than `--force`: it refuses to overwrite work someone
else pushed to your branch.

**"I've been stuck for ages."**
How long is ages? If it's over an hour, you were supposed to ask forty minutes
ago. Comment on the issue.
