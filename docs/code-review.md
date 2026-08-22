# Code review

Most of you will review more PRs than you write. It is also the skill with the
biggest effect on whether this project produces something good — a reviewer
catches problems for the price of five minutes that would otherwise cost a
weekend.

Nobody arrives knowing how to do this. Here's the version worth copying.

---

## What review is for

Not gatekeeping. Three things:

1. **Catch what tests can't** — a subtle logic error, a missing permission
   check, a query that will be slow with real data.
2. **Spread knowledge** — after reviewing a PR, two people understand that code.
   That matters when someone can't make it one weekend.
3. **Keep the codebase coherent** — thirteen teams writing in thirteen styles
   produces something nobody can navigate by week eight.

Notice what isn't on that list: proving you're clever, or making the author
write it the way you would have.

---

## Reviewing: what to actually look for

Work down this list. The first three are worth more than everything after them.

### 1. Does it do what the issue asked?

Read the issue, then the PR. Does the change actually deliver the outcome? Did
it quietly do something _else_ as well? Scope creep in a PR is worth flagging
even when the extra work is good — it belongs in its own PR.

### 2. Can it leak someone's data?

**This is the highest-value thing you can check in this repo.** For every
endpoint:

- Is the user's identity read from `currentUser(req)` — never from the body, a
  query param, or a URL segment?
- Is the database query **filtered by that id**, or does it filter in JavaScript
  after fetching everything?
- Is there a test proving student A cannot read student B's row?

```ts
// Flag this — the id comes from the URL, so anyone can pass any id
const notes = await Note.find({ studentId: req.params.studentId })

// This is right — the id comes from the verified token
const notes = await Note.find({ studentId: currentUser(req).sub })
```

If you only ever check one thing in a review, check this.

### 3. Does it hold up with real data?

The seed has 1,200 attendance records and 221 submissions. Ask:

- Is there a loop making one query per item? (An N+1 — flag it.)
- Is an aggregate computed in JavaScript over every document instead of in an
  aggregation pipeline?
- Is there a `find()` with no filter and no limit?

```ts
// Flag: one query per student, 40 round trips
for (const student of students) {
  const rows = await Attendance.find({ studentId: student._id })
}
```

### 4. Are the tests meaningful?

Not "are there tests". Do they assert something that could actually fail? A test
that mocks the thing it's testing and asserts the mock was called proves
nothing.

The three that should be there: happy path, auth requirement, abuse case.

### 5. Does the UI handle the states?

Loading, empty, error, data. A screen that renders nothing while loading looks
broken. A list with no empty state is indistinguishable from a bug.

### 6. Does it match the conventions?

- Schemas imported from `@repo/validation`, not defined inline
- `asyncHandler` around async route handlers
- `HttpError` thrown rather than `res.status(500).send()`
- Colours from design tokens (`bg-surface`), never hex values
- Only files this team owns are touched

---

## How to write the comment

**Ask, don't instruct.** You are frequently missing context.

> ~~Move this into a service.~~

> Would this fit better in the service? Asking because the controller usually
> stays thin here — but if there's a reason it needs to be inline, ignore me.

**Say why.** A rule without a reason is something the author will work around
next time instead of internalising.

> ~~Don't do this.~~

> This runs one query per student, so it'll be 40 round trips with the seed data
> and worse in production. `$in` with the whole array would do it in one.

**Separate blocking from optional.** The author cannot read your mind about
which comments must be addressed.

> **Blocking:** this returns another student's notes when `studentId` is passed
> in the URL — see line 22.
>
> **Optional:** could pull the date formatting into a helper, but fine as is.

**Say what's good.** Genuinely — if someone wrote a clean aggregation or caught
an edge case, saying so takes five seconds and is most of what makes people want
to keep contributing.

**Review the code, not the person.** "This function is confusing" — fine. "Why
would you write it this way" — not fine.

---

## Approving

Approve when the change is correct and safe, not when it's what you would have
written. Style preferences are not blocking.

If it's _mostly_ fine with one small fix, approve with a comment rather than
requesting changes and disappearing for a day. Trust people to fix the small
thing.

Every PR needs **one peer from your team plus one lead**.

---

## Being reviewed

**Comments are not an attack.** Everyone's code is reviewed, at every level,
forever. A PR with fifteen comments usually means the reviewer took it
seriously.

**Reply to every comment**, even just with "done" or a thumbs up, so the
reviewer knows nothing was missed.

**Disagree when you disagree.** You have context the reviewer doesn't. "I tried
that first — it breaks because X" is a completely valid response and often
teaches the reviewer something.

**Ask when it's unclear.** "I'm not sure what you'd expect here, can you show
me?" is normal.

**Push fixes as new commits**, not a rewritten history — the reviewer needs to
see what changed since they looked. Squashing happens at merge.

---

## Speed

**Review within a day.** Ideally the same weekend.

This is the single biggest thing you can do for the project's momentum. A PR
reviewed on Saturday unblocks someone's weekend. The same PR reviewed on
Wednesday cost them theirs — and by then it conflicts with `main` and they have
to rebase.

If you can't get to it, say so on the PR so someone else picks it up.

---

## The two-minute version

Reviewing:

1. Does it do what the issue asked?
2. **Can it leak another user's data?**
3. Will it hold up with 1,200 rows?
4. Do the tests assert something real?
5. Loading / empty / error states?
6. Conventions followed?

Then: ask rather than instruct, say why, mark blocking vs optional, and say what
was good.
