# Tasks: Completa la pantalla de seleccion de organizaciones

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~200 (43 del + ~200 add) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-always |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Full screen rewrite with all features | PR 1 | Single file; all improvements fit in one PR under 400 lines |

## Phase 1: Layout & Skeleton

- [x] 1.1 Add imports: Card, CardHeader/CardTitle/CardDescription/CardContent/CardFooter, Skeleton, SearchInput, Avatar/AvatarImage/AvatarFallback, toast from "sonner", useState/useEffect/useRef from React; remove Button import
- [x] 1.2 Add helper functions `getInitials(name)` and `getMetadata(org)` at module scope
- [x] 1.3 Rewrite outer layout: centered Card (`min-h-svh`, `max-w-2xl`) with title "Seleccionar Organización" and subtitle "Elige una organización para continuar"
- [x] 1.4 Rewrite `SelectOrganizationScreenSkeleton` with matching Card layout + Skeleton placeholders for header, search slot, and 6 grid tiles

## Phase 2: Grid + Avatar

- [x] 2.1 Replace flat Button list with responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3`)
- [x] 2.2 Render each org as `Card size="sm"` with Avatar (AvatarImage src={org.logo}, AvatarFallback={getInitials(org.name)}), CardTitle (org.name), CardDescription (getMetadata(org))
- [x] 2.3 Add ARIA: `role="button"`, `tabIndex={0}`, `aria-label="Seleccionar organización {name}"`, `aria-disabled={pendingId === org.id}`, keyboard handler for Enter/Space

## Phase 3: Search/Filter

- [x] 3.1 Add `useState<string>` for search value and derived `filtered` variable filtering by name/legalName/slug (case-insensitive includes)
- [x] 3.2 Conditionally render `SearchInput` above grid when `organizations.length > 6`
- [x] 3.3 Add empty state: "No se encontraron organizaciones." when filtered list is empty

## Phase 4: Loading, Error & Navigation

- [x] 4.1 Add `pendingId` state (`useState<string | null>`), set in `onMutate`, clear in `onSettled`
- [x] 4.2 Add `onError` callback with `toast.error(error.message || "Error al seleccionar organización")` via Sonner
- [x] 4.3 Keep `window.location.replace("/")` in `onSuccess` (user override — do NOT use router.navigate)
- [x] 4.4 Add loading hint: render `Skeleton` in CardFooter when `pendingId === org.id`

## Phase 5: Auto-select & Final Polish

- [x] 5.1 Add `useRef(false)` guard and `useEffect` for auto-select when `organizations.length === 1`
- [x] 5.2 Add footer link: "¿Necesitas crear una? Registrar organización" linking to `/organization/register`
- [x] 5.3 Clean up: remove unused Button import, verify all Spanish copy matches spec, verify `rounded-none` on Card matches brutalist design
