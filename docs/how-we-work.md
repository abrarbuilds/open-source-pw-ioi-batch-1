# How we work

This is the thinking behind the repo. Read it once, properly — most of the rules
elsewhere stop looking arbitrary once you've read this.

---

## The problem we are actually solving

Forty-three people are going to commit to one repository on the same Saturdays,
and most of you are doing this for the first time. That single fact drives every
structural decision here.

The failure mode we are designing against is not "the code is bad". It is:

> Three weekends in, half the team is blocked on the other half, every PR
> conflicts with two others, nobody can run the project locally, and the people
> who are stuck stop showing up.

That is how large student projects die. Not from difficulty — from friction.

So the repo is built on one bet: **make every team independent, and the rest
takes care of itself.** Everything below is downstream of that.

---

## The four ideas

### 1. Vertical slices, not layers

Your team does not own "the frontend" or "the database". It owns a **feature,
all the way down**: the model, the API module, the validation schema, the
screens.

The alternative — a frontend team and a backend team who hand work across a
boundary — sounds tidy and creates a queue. One side waits, the other rushes,
and the handoff is where bugs live. Owning a vertical means your team can finish
something without asking anyone's permission.

The practical consequence: **you almost never need to edit a file another team
owns.** If you find yourself doing that repeatedly, something is wrong with the
design — say so in an issue rather than quietly working around it.

### 2. Nobody waits for anybody

This is the part we worked hardest on. Two mechanisms:

**The seed gives you real data on day one.** `npm run seed` creates 40 students,
48 sessions, 24 materials, 18 assignments, 221 submissions and 1,200 attendance
records. Team 12 can build analytics pipelines in week 2 without Team 06 having
shipped anything, because the _data_ exists even though the _endpoints_ don't.

**No team calls another team's HTTP endpoint.** If you need someone else's data,
import their model and read it directly. Model files are shared and importable;
module folders are owned. This is what converts "I'm blocked until they ship"
into "I read their table."

The cost is honest: the same logic can end up written twice. Where that actually
matters — the attendance-percentage formula is the real case — the owning team
publishes it and everyone reuses it. That is what the Agreements table is for.

### 3. The contract comes first

Before either half of your team writes implementation code, **merge your Zod
schema** in `packages/validation/src/<feature>.ts`.

That file is the agreement between the person building the API and the person
building the screen. Once it exists, the frontend can build against mock data
shaped by the schema and the backend can build the real thing, in parallel, and
they will meet in the middle. Without it, one of them is guessing and the
integration weekend becomes a rewrite.

This is the single highest-leverage rule in the project. It is also the easiest
to skip when you're excited to start coding. Don't.

### 4. Files everyone edits are the enemy

Merge conflicts don't come from lots of code. They come from _shared files_. So
the repo has almost none, by design:

- Backend modules **self-register**, so `app.ts` never changes when you add a feature.
- There are **no barrel files** — you import `@repo/models/user`, not from an index that every team edits.
- Nav entries are **one file each**.
- Dependencies are **frozen after week 1** so `package-lock.json` stops moving.

Where a shared file is unavoidable, it's an **append-only registry**: you add one
alphabetically-placed line and git merges it cleanly. `modules.ts` and
`scripts/seed/index.ts` work this way.

---

## The weekend rhythm

You are working weekends over roughly two months. That's a real constraint: a
weekend is short, and momentum lost between weekends is expensive.

**Friday — decide.** Your team picks what it's doing and comments on the issues.
Five minutes of "who's taking what" saves two people building the same thing.

**Saturday — build.** Head-down work. Open a **draft PR early** — as soon as you
have anything running, not when you're finished. A draft PR is how your teammates
see what you're doing without asking, and how a reviewer catches a wrong turn on
Saturday instead of Sunday night.

**Sunday — land it.** Get it reviewed and merged. A PR that sits unmerged over a
week goes stale, conflicts, and drains the person who wrote it.

**Everything merged by Sunday night.** Not because of ceremony — because
`main` is deployed, and a week of half-finished work in a branch is a week of
work nobody can see or build on.

### The most important habit: split the work smaller than feels natural

The instinct is to build the whole feature and open one PR. Resist it. A
400-line PR gets reviewed in an evening; a 1,500-line PR sits for a week because
nobody has the energy to start it.

Ship the read endpoint before the write endpoint. Ship the list screen before
the detail screen. Each one merges, deploys, and stops being your problem.

---

## Claiming work

1. Find an issue labelled with your team.
2. **Comment on it** before you start. This is the whole coordination
   mechanism — there is nothing else.
3. If you stop working on it, comment again so someone else can take it.

If an issue you want is already claimed, pick another and pair with them if it's
big. Two people on one issue is fine; two people _silently_ on one issue is a
wasted weekend.

---

## When you are stuck

**Ask after an hour.** Not after a day, not after a weekend.

This is a real rule, not encouragement. An hour is roughly where an interesting
problem turns into a demoralising one. Asking early is how experienced engineers
work — the reason it looks like they don't get stuck is that they get unstuck
fast.

Where to ask, in order:

1. **Comment on the issue** — keeps the context with the work, and the answer
   helps whoever hits it next.
2. **Your team lead** — for anything about your own feature.
3. **Discussions** — for setup and tooling problems.
4. **The owning team's issue** — if it's about their code.

A good question includes what you tried, what you expected, and what actually
happened. "It doesn't work" costs a round trip; the error message and the
command you ran usually gets an answer first time.

**There is no penalty here for not knowing something.** The only thing that
actually costs the project is silence.

---

## What "done" means

Not "the code is written". A change is done when:

- `npm run lint`, `npm run typecheck` and `npm run test` pass locally
- There are tests for the happy path, the auth requirement, and one abuse case
- Every list renders **loading**, **empty**, and **data** states
- Errors are handled — a failed request shows something a human can act on
- You have actually clicked through it, signed in as a seeded user
- It's merged

That last one matters. Work in a branch is not done. It is work.

---

## Tests are how you say what you meant

Most of you have written tests because you were told to. Here they do a specific
job: **they are the part of your PR a reviewer trusts.**

A reviewer can't run every path of your code in their head. What they can do is
read your tests and see what you believed the code should do. If the test says
"a student cannot read another student's submission" and it passes, that's a
fact about the system, not an opinion in a comment.

This is why every endpoint needs three: the happy path, the auth requirement,
and one way it can be abused. The third one is the one that catches real bugs —
and in this project, "student A can read student B's data" is the bug class we
care most about.

Read `apps/api-student/src/modules/auth/auth.test.ts` before writing your first
test. It shows the shape, including why the wrong-password and unknown-email
errors have to be identical.

---

## Working with the people, not just the code

- **Review speed is a kindness.** A PR you review on Saturday unblocks someone's
  weekend. The same PR reviewed on Wednesday cost them theirs.
- **Assume good faith.** Confusing code usually means someone was learning, not
  careless. See [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md).
- **Credit people.** If a review made your PR better, say so in the PR.
- **Nobody here is expected to already know this.** Not the frameworks, not
  MongoDB aggregations, not git. Everybody is figuring it out; the ones who look
  fast are just asking earlier.

---

## Things that will go wrong (and what to do)

| What happens                              | What to do                                                                                  |
| ----------------------------------------- | ------------------------------------------------------------------------------------------- |
| Your branch conflicts with `main`         | `git fetch && git rebase origin/main`. If it's ugly, ask — don't force-push in a panic      |
| You need an npm package                   | Open a **dependency request** issue. Team 01 batches them weekly. Don't `npm install` it    |
| You need a component that doesn't exist   | Issue for Team 02. Don't build a one-off button                                             |
| Another team's endpoint doesn't exist yet | You don't need it — read their model directly                                               |
| You need to change a locked file          | Open an issue explaining why. Someone will either do it or show you the way around it       |
| CI fails and you don't understand why     | Paste the failing output in your PR and ask. It's usually lint or a type error              |
| You broke `main`                          | Say so immediately in the PR or Discussions. Nobody is angry; the fix is fast if it's known |

---

## Where to go next

- **[first-contribution.md](first-contribution.md)** — step by step from issue to merged PR
- **[code-review.md](code-review.md)** — how to review, and how to be reviewed
- **[recipes/build-a-feature.md](recipes/build-a-feature.md)** — a full vertical, worked through
- **[architecture.md](architecture.md)** — how the system fits together and why
- **[teams.md](teams.md)** — who owns what
