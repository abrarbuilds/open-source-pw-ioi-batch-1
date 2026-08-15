# ADR 0001 — A separate admin API

**Status:** accepted · **Date:** 2026-08-15

## Context

The product needs a student experience and an admin/faculty experience. Both
read and write the same collections. The obvious design is one API with role
guards on the admin routes.

The constraint that changes the answer is the team: ~43 students in 13 teams,
most writing production code for the first time, all merging over the same
weekends for two months. Code review will catch a lot, but not everything, and
the reviewers are also first-timers.

## Decision

Run two Express services — `api-student` and `api-admin` — against one database.
`api-admin` mounts every module behind `requireAuth` + `requireRole('ADMIN',
'FACULTY')` in `src/app.ts`, so a module cannot opt out of the gate.

Everything shareable lives in `packages/`: Mongoose models, auth and session
handling, HTTP plumbing, Zod schemas, UI components.

## Consequences

**Good**

- A forgotten role check inside an admin module is a defence-in-depth failure,
  not a data breach. The gate is in one reviewed, tested file.
- Two teams (Admin Core, Admin People) get a codebase they own end to end,
  which matters when you are trying to give thirteen teams real ownership.
- The admin API can rate-limit harder and log more without affecting students.
- `api-admin/src/app.test.ts` is a single place that proves "students cannot
  reach admin functionality", and it will keep proving it for two months.

**Bad**

- Two deployments, two sets of environment variables, two cold-start paths.
- Some controller code is genuinely duplicated — roughly the auth controller in
  each app. We accepted this rather than over-abstracting two things that differ
  in behaviour (the admin portal has no self-registration, and re-checks role on
  every token refresh).
- A change to a shared model can break two services. CI runs both test suites on
  every PR, which is the mitigation.

**Rejected alternative:** one API with `requireRole` per route. Less
infrastructure, but it puts the security boundary in ~40 places maintained by 13
teams instead of one place maintained by leads. Correct for a small experienced
team; wrong for this one.
