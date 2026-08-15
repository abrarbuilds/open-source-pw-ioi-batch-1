# The 13 teams

Teams are **full-stack feature teams of 3–4**, not role silos. A frontend
student and a backend student sit in the same team and ship one vertical
together — that is what lets thirteen teams work the same Saturday, because each
team owns its own folders at every layer.

Role identity is preserved *within* the team: typically 2 frontend + 2 backend,
or 2 + 1 for three-person teams.

**43 contributors + 2 program maintainers = 45.**

| # | Team | Size | Owns |
|---|---|---|---|
| **01** | Core Platform & DevOps | 3 | repo root, `turbo.json`, `.github/`, `packages/{config,http,client}`, `models/db.ts`, seed harness, test harness |
| **02** | Design System & UI Kit | 3 | `packages/ui`, `theme.css`, root layouts, dashboard shells in both apps |
| **03** | Auth & Identity | 4 | `packages/auth`, `models/user.ts`, `modules/auth` in both APIs, login screens, route guards |
| **04** | Class Materials | 3 | `models/material.ts`, `modules/materials` in both APIs, Cloudinary signing, `web-student/features/materials` |
| **05** | Assignments & Submissions | 4 | `models/{assignment,submission}.ts`, `modules/assignments`, submit flow, grading endpoints |
| **06** | Attendance | 4 | `models/attendance.ts`, `modules/attendance`, aggregation pipelines, attendance % screens |
| **07** | Timetable & Sessions | 3 | `models/class-session.ts`, `modules/sessions`, weekly timetable, today's classes |
| **08** | Announcements & Notifications | 3 | `models/{announcement,notification}.ts`, feed, notification bell, email digest |
| **09** | Student Dashboard & Progress | 3 | `web-student/app/(dashboard)/dashboard/`, progress charts, grade breakdown, profile |
| **10** | Admin Core & Batch Management | 4 | `web-admin` shell, `models/{batch,subject,enrollment}.ts`, `api-admin/modules/batches`, CSV import |
| **11** | Admin People, Roles & Audit | 3 | `api-admin/modules/users`, role assignment, `models/audit-log.ts`, user management UI |
| **12** | Admin Analytics & Reports | 3 | `api-admin/modules/analytics`, batch dashboards, at-risk report, CSV export |
| **13** | AI Assistant Bot | 3 | `api-student/modules/assistant`, tool definitions, `web-student/features/assistant` |

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

## What to do on weekend 1 if your team is blocked

Teams 01, 02 and 03 are the foundation; the other ten cannot build against real
auth or real UI components until week 1 ends. That does not mean waiting — the
highest-leverage work available is contract-first:

1. **Write and merge your Zod schema** in `packages/validation/src/<feature>.ts`.
   This is the contract both halves of your team code against, and it unblocks
   everything else.
2. **Write mock data** in your feature's `api.ts` so the frontend half can build
   screens immediately.
3. **Write `scripts/seed/<feature>.seed.ts`** so there is realistic demo data the
   day your endpoints land.
4. **Break your team's scope into issues** for weeks 2–8, labelled `team:NN`.

A team that does all four in week 1 will be faster for the remaining seven than
one that spent week 1 waiting for auth.

## Timeline

| Phase | Weekend | What ships | Teams leading |
|---|---|---|---|
| **P0** | W0 | scaffold, CI, Vercel projects, Atlas, seed, docs, seeded issues | maintainers |
| **P1** | W1–W2 | auth end to end, UI kit, dashboard shells, batch/subject CRUD | 01, 02, 03, 10 |
| **P2** | W3–W5 | materials library, assignment submit + grade, attendance | 04, 05, 06, 10, 11 |
| **P3** | W6–W7 | timetable, announcements, progress dashboard, analytics, AI assistant | 07, 08, 09, 12, 13 |
| **P4** | W8 | a11y, empty/error states, E2E suite, perf, rate limiting, docs | all |

Each weekend ends merged and deployed. The live URLs should never sit broken.

**Stretch backlog, never required:** mentorship pairing, placement tracker,
leaderboard, dark mode refinement, PWA/offline, mobile app. These exist as
`enhancement` issues from day one so a fast team always has somewhere to go.
