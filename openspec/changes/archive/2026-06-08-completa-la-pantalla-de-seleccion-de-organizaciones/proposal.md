# Proposal: Completa la pantalla de seleccion de organizaciones en @apps/web/src/modules/iam/screens/select-organization.screen.tsx

## Intent

The organization selection screen (`select-organization.screen.tsx`) is currently a 43-line minimal implementation: a plain `<div>` with unstyled `<Button>` components, no layout, no loading states, no error handling, no accessibility, and a hard `window.location.replace("/")` redirect. This screen is the first thing a multi-organization user sees after signing in, and its current state creates a poor UX impression and breaks the visual consistency established by the SignIn/SignUp screens.

We need to bring this screen to production quality, matching the design system and interaction patterns used across the fludge web app.

## Scope

### In Scope
- **Layout parity**: Centered Card layout (`min-h-svh`, `max-w-2xl`, Card with Header/Content/Footer) matching SignIn/SignUp screens
- **Skeleton**: Real `SelectOrganizationScreenSkeleton` using `Skeleton` components
- **Loading state**: `setActiveOrganization.isPending` disables the clicked organization button
- **Error handling**: `onError` callback with `toast.error()` via Sonner
- **ARIA labels**: `aria-label="Seleccionar organización {name}"` on each org button
- **Spanish copy**: "Seleccionar Organización", "Elige una organización para continuar"
- **Organization logo display**: `organization.logo` with fallback to initials in a styled div
- **Search/filter**: `SearchInput` + `useState` filter for when `organizations.length > 6`
- **Grid layout**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3` for organization cards
- **Auto-select**: If `organizations.length === 1`, automatically select and redirect
- **SPA navigation**: Replace `window.location.replace` with `useRouter().navigate` from TanStack Router
- **Metadata display**: Show `legalName`, `taxId`, or `address` as secondary text below each org name
- **Brutalist design consistency**: `rounded-none`, ring-based styling, no border-radius

### Out of Scope
- Organization creation/registration flow (handled by `/organization/register` route)
- Organization settings or editing
- Multi-organization switching after initial selection (different feature)
- Avatar component creation (no Avatar component available; we use `img` or initials div)
- Animations beyond the existing Skeleton pulse
- Pagination or virtual scrolling for large org lists (>50)

## Capabilities

### New Capabilities
- `organization-selection`: Full-screen organization picker with search, grid layout, logo display, metadata, loading states, and auto-selection

### Modified Capabilities
- None (this is a pure UI/UX enhancement; no existing capability requirements change)

## Approach

1. **Layout**: Wrap the screen in the same `flex min-h-svh items-center justify-center p-4` pattern used by SignIn/SignUp. Use a `Card className="w-full max-w-2xl"` (wider than auth screens since we show multiple orgs).
2. **Skeleton**: Create a skeleton layout with `Card` + `Skeleton` rectangles for the header, search input, and a grid of org placeholders.
3. **Organization card**: Each org becomes a card-like button using `Card` with `size="sm"`, displaying:
   - Logo: `<img>` if `logo` exists, otherwise a `<div>` with first two initials
   - Name: `CardTitle`
   - Metadata: `CardDescription` showing `legalName` or `taxId` or `address`
   - Full `aria-label` for accessibility
4. **State management**: Use `useState` for search filter text. Filter by `name`, `legalName`, `slug`. Show `SearchInput` conditionally only when `organizations.length > 6`.
5. **Auto-select**: Use `useEffect` in the component to check `organizations.length === 1` on mount and automatically call `handleClick` with the single organization.
6. **Navigation**: Replace `window.location.replace` with `const router = useRouter(); router.navigate({ to: "/" })`.
7. **Error handling**: Add `onError: (error) => { toast.error(error.message || "Error al seleccionar organización"); }` to the mutation options.
8. **Loading**: Track the clicked org ID in a local `useState` to disable only the clicked button, not all buttons.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/web/src/modules/iam/screens/select-organization.screen.tsx` | Major rewrite | Full screen implementation with all features |
| `apps/web/src/routes/organization/_layout/select.tsx` | Minor | No changes needed (already handles 0 orgs redirect); verify auto-select doesn't conflict with loader |
| `packages/ui/src/components/search-input.tsx` | None (existing) | Consumed by the screen |
| `packages/ui/src/components/skeleton.tsx` | None (existing) | Consumed by the screen |
| `apps/web/src/integrations/query/index.tsx` | None (existing) | Error handling pattern reference (Sonner) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Auto-select on 1 org causes infinite redirect loop | Low | Auto-select only triggers inside the component after data is loaded, not in the route loader. The route loader only redirects on 0 orgs. |
| Search filter performance on large lists | Low | Current data is client-side only. If >50 orgs, add debounce or pagination later. |
| `useRouter().navigate` causes stale state vs hard reload | Low | The mutation already calls `queryClient.prefetchQuery` for session and active org. SPA navigation is correct. |
| Logo image broken URL | Low | Add `onError` handler on `<img>` to fall back to initials div. |
| Accessibility gaps with grid of buttons | Low | Each org button has `aria-label`. Use semantic `<button>` elements. |

## Rollback Plan

1. Revert `select-organization.screen.tsx` to the previous 43-line implementation (stored in git).
2. No backend or database changes are involved — rollback is purely a git revert of the single file.

## Dependencies

- `@tanstack/react-router` (already available for `useRouter`)
- `sonner` (already installed and used via `apps/web/src/routes/__root.tsx`)
- `@fludge/ui/components/card`, `button`, `skeleton`, `search-input` (all existing)
- No external dependencies needed.

## Success Criteria

- [ ] Screen renders a centered Card layout matching the auth screens
- [ ] Skeleton screen shows during route loading (pendingComponent)
- [ ] Each organization is displayed with logo (or initials fallback), name, and metadata
- [ ] Organizations are laid out in a responsive grid (1/2/3 columns)
- [ ] Search filter appears when >6 orgs and filters correctly by name/legalName/slug
- [ ] Clicking an org shows a loading state (disabled button) and navigates via SPA router
- [ ] Error during selection shows a Sonner toast
- [ ] Auto-select works when exactly 1 organization exists
- [ ] All interactive elements have proper ARIA labels
- [ ] Spanish copy is used throughout
- [ ] Visual style matches brutalist design (rounded-none, ring-based)
