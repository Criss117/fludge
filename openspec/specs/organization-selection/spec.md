# organization-selection Specification

## Purpose

Defines the requirements for the organization selection screen — the first screen a multi-organization user sees after signing in. Covers layout, loading states, search/filter, auto-selection, error handling, accessibility, and navigation.

## Requirements

### Requirement: Card Layout and Visual Consistency

The system MUST render the organization selection screen as a centered Card layout matching the SignIn/SignUp screens, using brutalist design tokens (`rounded-none`, ring-based borders).

| Field | Value |
|-------|-------|
| Container | `flex min-h-svh items-center justify-center p-4` |
| Card | `w-full max-w-2xl` with Header, Content, Footer sections |
| Header title | "Seleccionar Organización" |
| Header subtitle | "Elige una organización para continuar" |
| Design | `rounded-none` on all interactive elements, ring-based borders |

#### Scenario: Screen renders centered card

- GIVEN the user navigates to the organization selection route
- WHEN the screen loads with organization data
- THEN a centered Card is displayed with `max-w-2xl` width
- AND the header shows "Seleccionar Organización" with subtitle "Elige una organización para continuar"
- AND all interactive elements have `rounded-none` styling

#### Scenario: Responsive card width

- GIVEN the screen is viewed on mobile (< 768px)
- WHEN the card renders
- THEN it takes full width minus padding (`p-4`)
- AND does not overflow the viewport

### Requirement: Organization Grid Display

The system MUST display organizations in a responsive grid layout with logo, name, and metadata for each organization.

| Field | Value |
|-------|-------|
| Grid | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3` |
| Logo | `Avatar` component with `AvatarImage` (src: `organization.logo`) + `AvatarFallback` (initials) |
| Name | `CardTitle` showing `organization.name` |
| Metadata | `CardDescription` showing `legalName` OR `taxId` OR `address` (first available) |
| Button | Card-styled button (`Card` + `size="sm"`) wrapping each org |

#### Scenario: Multiple organizations display in grid

- GIVEN the user has 5 organizations
- WHEN the screen renders
- THEN organizations appear in a 1-column grid on mobile, 2 columns on tablet, 3 columns on desktop
- AND each card shows the logo (or initials fallback), name, and metadata

#### Scenario: Logo displays with Avatar component

- GIVEN an organization has a valid `logo` URL
- WHEN the card renders
- THEN `AvatarImage` displays the logo
- AND the Avatar container is visible

#### Scenario: Logo fallback to initials

- GIVEN an organization has no `logo` or the image fails to load
- WHEN the card renders
- THEN `AvatarFallback` displays the first two letters of `organization.name` in uppercase
- AND no broken image icon is shown

#### Scenario: Metadata fallback chain

- GIVEN an organization has `legalName` set
- WHEN the card renders
- THEN `CardDescription` shows `legalName`
- AND if `legalName` is empty, shows `taxId`
- AND if both are empty, shows `address`
- AND if none are available, shows no metadata line

### Requirement: Search and Filter

The system MUST provide a search input that filters organizations by name, legalName, or slug when there are more than 6 organizations.

| Field | Value |
|-------|-------|
| Component | `SearchInput` from `@fludge/ui/components/search-input` |
| Visibility | Only when `organizations.length > 6` |
| Filter fields | `name`, `legalName`, `slug` (case-insensitive) |
| State | Local `useState<string>` for filter text |

#### Scenario: Search appears for large org lists

- GIVEN the user has 7 or more organizations
- WHEN the screen renders
- THEN a `SearchInput` is visible above the grid
- AND the placeholder text is in Spanish

#### Scenario: Search filters organizations

- GIVEN the search input is visible
- WHEN the user types "acme"
- THEN only organizations whose `name`, `legalName`, or `slug` contains "acme" (case-insensitive) are shown
- AND the grid updates immediately

#### Scenario: Search hidden for small org lists

- GIVEN the user has 6 or fewer organizations
- WHEN the screen renders
- THEN no search input is displayed
- AND all organizations are shown in the grid

#### Scenario: Search clears to show all orgs

- GIVEN the user has typed a filter query
- WHEN the user clears the search input
- THEN all organizations are displayed again

### Requirement: Loading State and Skeleton

The system MUST display a skeleton screen during route loading and disable individual buttons while a selection is pending.

| Field | Value |
|-------|-------|
| Skeleton | `SelectOrganizationScreenSkeleton` with `Skeleton` components for header, search, and grid placeholders |
| Button loading | Only the clicked button is disabled (track via local `useState` of clicked org ID) |
| Pending state | `setActiveOrganization.isPending` |

#### Scenario: Skeleton displays during route loading

- GIVEN the route data is still fetching
- WHEN the `pendingComponent` renders
- THEN `SelectOrganizationScreenSkeleton` shows placeholder rectangles for header, search (if applicable), and org cards
- AND the skeleton uses the same Card layout structure

#### Scenario: Individual button disables during selection

- GIVEN the user clicks on organization "Acme Corp"
- WHEN the `setActiveOrganization` mutation is pending
- THEN only the "Acme Corp" button is disabled
- AND other organization buttons remain clickable
- AND a visual loading indicator is shown on the clicked button

### Requirement: Error Handling with Toast

The system MUST display an error toast when the organization selection mutation fails.

| Field | Value |
|-------|-------|
| Toast library | Sonner (`toast.error()`) |
| Error message | `error.message` or fallback "Error al seleccionar organización" |
| Trigger | `onError` callback in mutation options |

#### Scenario: Error toast on mutation failure

- GIVEN the user clicks an organization
- WHEN the `setActiveOrganization` mutation fails
- THEN a Sonner `toast.error()` is displayed
- AND the message shows the error's `message` property
- AND if the error has no message, shows "Error al seleccionar organización"

#### Scenario: Button re-enables after error

- GIVEN the mutation failed and the error toast was shown
- WHEN the error callback completes
- THEN the previously clicked button is re-enabled
- AND the user can click it again

### Requirement: Auto-Select Single Organization

The system MUST automatically select and redirect when the user has exactly one organization.

| Field | Value |
|-------|-------|
| Trigger | `organizations.length === 1` |
| Mechanism | `useEffect` in component (NOT in route loader) |
| Action | Call `handleClick` with the single organization |

#### Scenario: Auto-select on single organization

- GIVEN the user belongs to exactly one organization
- WHEN the screen mounts and data is loaded
- THEN `handleClick` is automatically called with that organization
- AND the user is redirected to the dashboard

#### Scenario: Auto-select does not cause infinite loop

- GIVEN the route loader already handles 0-organization redirect
- WHEN the component auto-selects the single organization
- THEN the redirect happens only once
- AND no redirect loop occurs

### Requirement: Navigation After Selection

The system MUST navigate using `window.location.replace` after a successful organization selection. This is an intentional override from the original `router.navigate` spec — a full page reload ensures the session and active organization are freshly hydrated from the server.

| Field | Value |
|-------|-------|
| Navigation | `window.location.replace("/")` |
| Rationale | User override — preserves server-side session hydration guarantees |
| Tradeoff | Prefetched queries (session, active org) are discarded by the hard reload |

#### Scenario: Hard navigation after successful selection

- GIVEN the user clicks an organization
- WHEN the mutation succeeds
- THEN `window.location.replace("/")` is called
- AND the page performs a full reload to the dashboard

### Requirement: ARIA Accessibility

The system MUST provide proper ARIA labels on all interactive elements for screen reader support.

| Field | Value |
|-------|-------|
| Button label | `aria-label="Seleccionar organización {name}"` |
| Search input | Inherited from `SearchInput` component |
| Semantic elements | Use Card with `role="button"` for org selection |

#### Scenario: Screen reader announces organization buttons

- GIVEN a screen reader user navigates the grid
- WHEN focus moves to an organization button
- THEN the screen reader announces "Seleccionar organización {name}"
- AND the button role is correctly identified

### Requirement: Spanish Copy

The system MUST use Spanish text for all user-facing copy.

| Element | Text |
|---------|------|
| Title | "Seleccionar Organización" |
| Subtitle | "Elige una organización para continuar" |
| Search placeholder | "Buscar organización..." |
| Error toast fallback | "Error al seleccionar organización" |

#### Scenario: All UI text is in Spanish

- GIVEN the screen renders in any state
- WHEN any text is displayed to the user
- THEN the text is in Spanish
- AND no English copy is visible
