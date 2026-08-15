# Features — `web-student`

One folder per feature, owned entirely by one team. This is where the actual work
happens; `app/(dashboard)/<feature>/page.tsx` should be a thin file that composes
components from here.

```
features/
  materials/            ← Team 04
    components/         React components for this feature only
    hooks/              useMaterials(), useMaterialUpload(), ...
    api.ts              every call this feature makes to api-student
```

## Rules

- **Never call `fetch` directly.** Use `api` from `@/lib/api-client` — it handles
  the access token and the silent refresh on 401.
- **Types come from `@repo/validation/<feature>`**, the same file your team's
  backend half validates with. If you find yourself writing an `interface` that
  describes an API response, it belongs there instead.
- **Shared components go through Team 02.** If two features need the same
  component, it moves to `@repo/ui` — open an issue rather than copying it.
- **Every list renders three states**: loading (`Skeleton`), empty
  (`EmptyState`), and data. A blank screen is indistinguishable from a bug.

## Building before the API exists

You do not have to wait for the backend half of your team. Write your Zod schema
in `packages/validation` first, then make `api.ts` return mock data shaped by that
schema behind an `if (process.env.NEXT_PUBLIC_USE_MOCKS)` check. Swap it for the
real call when the endpoint lands — the components never change.
