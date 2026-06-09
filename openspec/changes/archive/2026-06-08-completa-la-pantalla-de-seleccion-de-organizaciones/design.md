# Design: Completa la pantalla de seleccion de organizaciones en select-organization.screen.tsx

## Technical Approach

Single-file rewrite of `apps/web/src/modules/iam/screens/select-organization.screen.tsx` (43 lines → ~200 lines). We bring the screen to parity with the auth screens (`sign-in`, `sign-up`): centered `Card` layout, `Skeleton` for the `pendingComponent`, per-button loading state, Sonner error toasts, SPA navigation, client-side search, and single-org auto-select. No backend, no dependency, no type changes — only a UI module.

## Architecture Decisions

### Decision: Use `Card size="sm"` as the clickable org tile, not a `Button` wrapping a `Card`

**Choice**: Each organization renders as a `Card size="sm"` with an inline `onClick` + `role="button"` + `tabIndex=0` + keyboard handler. The whole card surface is the hit target.
**Alternatives considered**: (a) `<Button variant="outline">` wrapping the card — rejected because Button's flex layout and padding fights Card's own padding, producing double-padding glitches. (b) Native `<button>` with `className="appearance-none"` styled as a Card — rejected because Base UI's `Button` is the project primitive, leaving it loses focus-ring/disabled consistency.
**Rationale**: The auth screens use `Card` as the layout primitive; using `Card` for org tiles keeps a single visual language. Inline accessibility props avoid wrapping another component.

### Decision: Track the clicked org in local `useState`, not in the mutation

**Choice**: `const [pendingId, setPendingId] = useState<string | null>(null)`. We pass it in the mutate's `onMutate` (set id) and `onSettled` (clear id).
**Alternatives considered**: Reading `setActiveOrganization.isPending` + `setActiveOrganization.variables` to derive the id — works but is more brittle and triggers a re-render on every mutation state change. Setting local state keeps re-renders scoped to the moment of click → settle.
**Rationale**: The proposal calls out "disable only the clicked button, not all buttons". Local state mirrors this requirement directly.

### Decision: Auto-select with `useEffect` + ref-guard, not with derived state in render

**Choice**: A `useEffect` that watches `organizations.length === 1` and calls the same `handleClick` path. Guard with a `useRef<boolean>` to prevent re-entry if the mutation re-renders the component before navigation.
**Alternatives considered**: Conditional render `if (organizations.length === 1) return <Redirecting />` — rejected because the mutation lives in a hook, and we'd need a separate effect anyway. Calling `handleClick` during render — rejected (React rule: side effects in render are forbidden; we'd be calling a mutation, which is async).
**Rationale**: Effects are the correct primitive for "do this once when this becomes true". Ref-guard handles the legitimate case where `useSetActiveOrganization` returns a new object on each render and re-fires the effect.

### Decision: `window.location.replace("/")` instead of `useRouter().navigate({ to: "/" })`

**Choice**: Keep `window.location.replace("/")` — explicit user override documented in task 4.3. The original design proposed `useRouter().navigate`, but the user chose to keep the hard reload to ensure fresh server-side hydration of session and active org.
**Alternatives considered**: `useRouter().navigate` — rejected by user override. `<Link to="/">` — rejected (programmatic trigger needed from mutation callback).
**Rationale**: User override. The mutation already prefetches session + active org, but the hard reload discards those prefetches. This is an accepted tradeoff for session consistency guarantees.

### Decision: Avatar via `<Avatar size="lg">` + `<AvatarImage>` + `<AvatarFallback>`, not raw `<img>`

**Choice**: Use the existing `Avatar` primitive from `@fludge/ui/components/avatar` (size `lg` = 40px). `AvatarImage` renders the org's `logo` URL; `AvatarFallback` shows the first two letters of `name`. `AvatarFallback` is shown when no `logo` is present OR when the image errors.
**Alternatives considered**: (a) Raw `<img>` with `onError` swap — rejected: the proposal/spec call this out as already the case in the `Out of Scope` section, and using the existing primitive keeps design-system consistency. (b) `Avatar size="default"` (32px) — rejected: 40px reads better in the grid card; auth screens use medium-large visual weight.
**Rationale**: Avatar primitive is already in the design system, brutalist-compliant (`rounded-full` is OK for avatars — the brutalist `rounded-none` applies to containers, not glyphs), and handles the broken-image case via Base UI's `AvatarImage` + `AvatarFallback` composition (Base UI swaps fallback in when the image fails to load, no manual `onError` needed).

### Decision: Search only when `organizations.length > 6`

**Choice**: `const showSearch = organizations.length > 6`. Below 6, no search input is rendered (zero visual noise for the common case of 1–5 orgs). Above 6, an `Input` (via `SearchInput` from `@fludge/ui/components/search-input`) is mounted and filters in-memory.
**Alternatives considered**: Always show search — rejected: dead UI for the 1–3 org case (which is the overwhelming majority). Debounced search — rejected: client-side `Array.filter` on 6–50 items is sub-millisecond; debounce adds complexity for zero benefit.
**Rationale**: The threshold (6) matches the spec literally and avoids shipping dead controls.

## Data Flow

```
Route loader (apps/web/src/routes/organization/_layout/select.tsx)
  └─ ensureQueryData(findAll) ──→ organizations[]
  └─ if length === 0  ──→ redirect(/organization/register)
  └─ else              ──→ render <SelectOrganizationScreen organizations={…} />

SelectOrganizationScreen
  ├─ useState<search>          ──→ filter derived value
  ├─ useState<pendingId>       ──→ per-button disabled
  ├─ useEffect(length===1)     ──→ auto-select once
  └─ handleClick(org)          ──→ setActiveOrganization.mutate(org, …)

useSetActiveOrganization
  ├─ authClient.organization.setActive(id, slug)
  ├─ queryClient.prefetchQuery(findActive)
  └─ queryClient.prefetchQuery(getSession)

onSuccess ──→ window.location.replace("/")
onError   ──→ toast.error(error.message ?? fallback)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/web/src/modules/iam/screens/select-organization.screen.tsx` | Rewrite | Full screen with Card layout, Skeleton, search, auto-select, window.location.replace, Sonner errors, Avatar |
| `apps/web/src/routes/organization/_layout/select.tsx` | None | Loader already redirects on 0 orgs; auto-select stays inside the screen |
| `apps/web/src/modules/iam/hooks/use-set-active-organization.ts` | None | Existing hook shape (`mutate(org, { onSuccess, onError })`) is what we need |

## Interfaces / Contracts

The `Props` interface stays identical:

```ts
interface Props {
  organizations: Awaited<
    ReturnType<ORPCType["organizations"]["queries"]["findAll"]["call"]>
  >;
}
```

Each `organization` has: `{ id, name, slug, logo, legalName, taxId, address, phone }` (Drizzle `organization` table in `packages/db/src/schemas/auth.schema.ts:86`).

Internal helpers (file-scoped, not exported):

```ts
function getInitials(name: string): string {
  // First letter of first 2 words, uppercased. "Mi Empresa SA" → "ME"
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

function getMetadata(org: Organization): string | null {
  // First non-empty of legalName, taxId, address
  return org.legalName || org.taxId || org.address || null;
}
```

## Component Composition (top-down)

```
<div className="flex min-h-svh items-center justify-center p-4">      ← outer (matches SignIn)
  <Card className="w-full max-w-2xl">                                ← wider than auth (multiple orgs)
    <CardHeader>
      <CardTitle>Seleccionar Organización</CardTitle>
      <CardDescription>Elige una organización para continuar</CardDescription>
    </CardHeader>

    <CardContent className="space-y-4">
      {showSearch && (
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar organización…"
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((org) => (
          <Card
            key={org.id}
            size="sm"
            role="button"
            tabIndex={0}
            aria-label={`Seleccionar organización ${org.name}`}
            aria-disabled={pendingId === org.id}
            onClick={() => pendingId === null && handleClick(org)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleClick(org)}
            className="cursor-pointer hover:bg-muted transition-colors"
          >
            <CardHeader>
              <Avatar size="lg">
                {org.logo && <AvatarImage src={org.logo} alt={org.name} />}
                <AvatarFallback>{getInitials(org.name)}</AvatarFallback>
              </Avatar>
              <CardTitle>{org.name}</CardTitle>
              {getMetadata(org) && (
                <CardDescription>{getMetadata(org)}</CardDescription>
              )}
            </CardHeader>
            {pendingId === org.id && (
              <CardFooter>
                <Skeleton className="h-3 w-20" />      ← inline "loading" hint
              </CardFooter>
            )}
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          No se encontraron organizaciones.
        </p>
      )}
    </CardContent>

    <CardFooter>
      <p className="text-xs text-muted-foreground">
        ¿Necesitas crear una?{" "}
        <Link to="/organization/register" className="text-primary underline-offset-4 hover:underline">
          Registrar organización
        </Link>
      </p>
    </CardFooter>
  </Card>
</div>

SelectOrganizationScreenSkeleton (separate export):
  Same outer div + same Card structure, but:
    - CardTitle / CardDescription → <Skeleton className="h-4 w-40" /> / <Skeleton className="h-3 w-64" />
    - Grid → 6 <Skeleton className="h-28" /> tiles (3 cols × 2 rows)
    - SearchInput slot → <Skeleton className="h-9 w-full" />
```

## State & Effects Detail

| State | Type | Purpose | Init |
|-------|------|---------|------|
| `search` | `string` | Filters `organizations` by name/legalName/slug (case-insensitive `includes`) | `""` |
| `pendingId` | `string \| null` | Disables only the clicked card; cleared in `onSettled` | `null` |
| `autoSelectedRef` | `useRef<boolean>` | One-shot guard for the `length === 1` effect | `false` |

```ts
useEffect(() => {
  if (organizations.length === 1 && !autoSelectedRef.current) {
    autoSelectedRef.current = true;
    handleClick(organizations[0]!);
  }
}, [organizations.length]); // intentionally narrow dep
```

`handleClick` signature:

```ts
const handleClick = (org: { id: string; slug: string }) => {
  setPendingId(org.id);
  setActiveOrganization.mutate(org, {
    onSettled: () => setPendingId(null),   // clear on either success or error
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Error al seleccionar organización");
    },
    onSuccess: () => window.location.replace("/"),
  });
};
```

Note: `onSettled` clears `pendingId` (handles both success and error paths). `onError` only toasts. `onSuccess` only navigates. Single responsibility per callback.

## Error Handling

| Failure | Surface |
|---------|---------|
| Mutation throws (network, ORPCError, etc.) | `toast.error(message)` via `sonner` (imported from `"sonner"` — same import path as `apps/web/src/integrations/query/index.tsx:8`) |
| `org.logo` URL 404s | `AvatarFallback` renders initials (Base UI handles this internally; no manual `onError` needed) |
| `organizations.length === 0` | Handled in the route loader (`redirect(/organization/register)`), never reaches the screen |
| `window.location.replace` throws | Bubbles to error boundary — handled by root errorComponent |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Type check | `Props` type, helper signatures | `bun run check-types` (config has `type_checker: true`) |
| Build | No Vite compile errors | `bun run build` (config has `build_command`) |
| Manual | Visual parity with auth screens; search; auto-select; loading; toast on error | Browser smoke test against `/organization/select` |
| Manual | Accessibility — Tab through cards, Enter/Space activate, screen reader reads `aria-label` | Keyboard + VoiceOver/NVDA |

No automated tests added (project has no runner configured — see `openspec/config.yaml:38-51`).

## Migration / Rollout

No migration required. No data shape change, no API change, no DB change. Pure frontend rewrite of one file. Rollback = `git revert` of the single file.

## Open Questions

- [ ] None — every decision point was covered.
