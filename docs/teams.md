# The 13 teams

Teams are **full-stack feature teams of 3–4**, not role silos. A frontend
student and a backend student sit in the same team and ship one vertical
together — that is what lets thirteen teams work the same Saturday, because each
team owns its own folders at every layer.

Role identity is preserved _within_ the team: typically 2 frontend + 2 backend,
or 2 + 1 for three-person teams.

**43 contributors + 2 program maintainers = 45.**

| #      | Team                          | Size | Owns                                                                                                                                   |
| ------ | ----------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **01** | Core Platform & DevOps        | 3    | repo root, `turbo.json`, `.github/`, `packages/{config,http,client}`, `models/db.ts`, seed harness, test harness                       |
| **02** | Design System & UI Kit        | 3    | `packages/ui`, `theme.css`, root layouts, dashboard shells in both apps                                                                |
| **03** | Auth & Identity               | 4    | `packages/auth`, `models/user.ts`, `modules/auth` in both APIs, login screens, route guards                                            |
| **04** | Class Materials               | 3    | `models/material.ts`, `modules/materials` in both APIs, Cloudinary signing, `web-student/features/materials`                           |
| **05** | Assignments & Submissions     | 4    | `models/{assignment,submission}.ts`, `modules/assignments`, submit flow, grading endpoints                                             |
| **06** | Attendance                    | 4    | `models/attendance.ts`, `modules/attendance`, aggregation pipelines, attendance % screens                                              |
| **07** | Timetable & Sessions          | 3    | `models/class-session.ts`, `modules/sessions`, weekly timetable, today's classes                                                       |
| **08** | Announcements & Notifications | 3    | `models/{announcement,notification}.ts`, feed, notification bell, email digest                                                         |
| **09** | Student Profile & Notes       | 3    | `models/{note,bookmark}.ts`, `modules/{notes,profile}`, notes/bookmarks/profile screens; dashboard assembly in the integration weekend |
| **10** | Admin Core & Batch Management | 4    | `web-admin` shell, `models/{batch,subject,enrollment}.ts`, `api-admin/modules/batches`, CSV import                                     |
| **11** | Admin People, Roles & Audit   | 3    | `api-admin/modules/users`, role assignment, `models/audit-log.ts`, user management UI                                                  |
| **12** | Admin Analytics & Reports     | 3    | `api-admin/modules/analytics`, batch dashboards, at-risk report, CSV export                                                            |
| **13** | AI Assistant Bot              | 3    | `api-student/modules/assistant`, tool definitions, `web-student/features/assistant`                                                    |

The authoritative version of this table is [`.github/CODEOWNERS`](../.github/CODEOWNERS)
— it is what GitHub actually enforces on pull requests.

## No QA team, on purpose

Every team writes tests for its own vertical. Team 01 owns the shared test
harness and the end-to-end suite that all teams contribute scenarios to.

A QA silo at this scale becomes a bottleneck that blocks twelve other teams, and
it teaches the wrong lesson — that testing is somebody else's job.

## Leads

Each team elects one lead from within its 3–4. Leads review their team's PRs and
attend a short cross-team sync. Three division leads (frontend, backend, admin)
plus the program maintainers own the locked files listed in CONTRIBUTING.md.

## Every team starts in week 1

There is no dependency ordering to wait out. Three things make that true:

1. **All the models are already scaffolded**, so nobody waits for a schema.
2. **Auth is already built**, so no team waits for login.
3. **`npm run seed` populates every collection** — 24 materials, 18 assignments,
   221 submissions, 1,200 attendance records, 48 sessions, announcements, notes.
   You never need another team to ship before you have realistic data.

Two rules keep it that way:

- **Never call another team's HTTP endpoint.** Need their data? Read their model
  directly, read-only. Model files are shared and importable; module folders are
  owned. This is the rule that removed every blocking dependency in the project.
- **Merge your Zod schema in week 1**, before either half of your team writes
  implementation code. It is the contract the frontend and backend build against
  in parallel.

## Agreements — not dependencies

Four decisions two or more teams must make the _same way_. Nobody is blocked by
them, but disagreeing is expensive to unpick. Settle them in week 1 and write
them here in `docs/`.

| Agreement                                                                                | Teams             | Owner  |
| ---------------------------------------------------------------------------------------- | ----------------- | ------ |
| Attendance-percentage formula (does `LATE` count? does `EXCUSED` leave the denominator?) | 06 · 09 · 12 · 13 | **06** |
| Batch timezone rule, and what "today" means                                              | 06 · 07 · 09      | **07** |
| One chart library, requested once                                                        | 09 · 12           | **12** |
| One Cloudinary signed-upload helper, written once                                        | 04 · 05 · 09      | **04** |

## Timeline

| Phase     | Weekend       | What ships                                                     |
| --------- | ------------- | -------------------------------------------------------------- |
| **W0**    | _maintainers_ | scaffold, CI, Vercel, Atlas, full seed, docs, team issues      |
| **W1**    | all 13 teams  | Zod contracts merged; implementation starts everywhere at once |
| **W2–W6** | all 13 teams  | each team ships its own vertical, independently                |
| **W7**    | integration   | dashboard assembly, `notify()` fan-out, cross-feature links    |
| **W8**    | all           | a11y, empty/error states, E2E suite, perf, rate limiting, docs |

Each weekend ends merged and deployed. The live URLs should never sit broken.

## MVP

MVP is **13 standalone verticals plus the login that already works**. Each team
ships something demoable on its own; nothing in the MVP requires two teams to
have finished. Everything cross-cutting — the composed dashboard, notification
fan-out, the assistant's weekly digest — is explicitly post-MVP and lands in the
integration weekend.

**Stretch backlog, never required:** mentorship pairing, placement tracker,
leaderboard, dark mode refinement, PWA/offline, mobile app. These exist as
`enhancement` issues from day one so a fast team always has somewhere to go.
