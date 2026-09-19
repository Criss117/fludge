# Feature: sales-list-screen

## Objective

Complete the sales list screen (dashboard sales tab): one card per sale with saleNumber/date/status, paymentType + total, customer id + items count, and a footer with "Tirilla" (receipt dialog), "Detalle" (no-op) and a more-vert popover (empty for now).

## Problem

`sale.screen.tsx` is a placeholder dumping JSON. The `useFindSales` infinite query and the local `SaleRepository` already exist; the UI is missing.

## Why

User request: "completa la pantalla de listado de ventas, quiero que muestres una card por venta ... un boton que diga tirilla que abrira un dialog ... basate en ChargeSaleSummarySection, un boton que diga detalle ... y un more vert que abrira un popover, por ahora sin contenido".

## Scope

New files:

- apps/native/src/modules/sales/presentation/components/sale-card.tsx (card + status chip + skeleton)
- apps/native/src/modules/sales/presentation/components/sale-receipt-dialog.tsx (receipt-style dialog)

Files to edit:

- apps/native/src/modules/sales/presentation/screens/sale.screen.tsx (FlatList + skeleton + empty/footer states)
- packages/i18n/src/locales/es/screens.ts (sales.history._, sales.status._, sales.card._, sales.receipt._)
- apps/native/src/app/(private)/dashboard/(tabs)/_layout.tsx (fix stale /(private)/sales link → /(private)/pos)
- apps/native/src/modules/sales/presentation/components/sale-summary/content.tsx (fix stale /sales/charge link → /pos/charge)

## Constraints

- Card pattern follows customer-card.tsx: fixed height + getItemLayout, compound Card.Header/Body/Footer, MaterialIcons, StatusChip-style chips.
- Receipt dialog bases on ChargeSaleSummarySection receipt style (RECEIPT_FONT_SIZE 13, dashed separators, muted meta).
- Tirilla = primary button; Detalle = outline, no onPress yet; more-vert = Popover (pattern from product-menu-options.tsx), empty content.
- findAll has no filters: list has no search input; screen calls useFindSales("").
- List perf rules: memoizable fixed-height cards, getItemLayout, hoisted components, no inline objects in renderItem.
- Keep the user's in-flight POS rename (pos/ routes, pos.screen.tsx) uncommitted; this commit only stages sales-list files + the two stale-route fixes.

## Checklist

- [x] T1: Fix stale route links (tabs header, charge summary) (commit 2cdd6d7 — included in the POS rename work unit)
- [x] T2: SaleCard + SaleStatusChip + skeleton (commit 502277c)
- [x] T3: SaleReceiptDialog (receipt-style, based on ChargeSaleSummarySection) (commit 502277c)
- [x] T4: Rewrite sale.screen.tsx list (FlatList, infinite scroll, skeleton/empty/footer) (commit 502277c)
- [x] T5: i18n keys (es) (commit 502277c)
- [x] T6: check-types + i18n tests + prettier (see evidence below)
- [x] T7: Persist created sale locally + invalidate sales list (user-authored, commit 9a94217)
- [x] T8: Receipt dialog scroll end-to-end (commit 13ea808)
- [x] T9: Pinned total footer + taller dialog (commit 176a199)
- [x] T10: gesture-handler ScrollView in receipt dialog (user-authored, commit 6c68dbe)

## Verification evidence

- bun run check-types → apps/native pass (tsc -b)
- bun run check-types → packages/api pass (tsc -b) (after user's create-sale.command changes)
- bun run check-types → packages/client pass (tsc -b) (after user's use-sale.mutations changes)
- bun run check-types → packages/i18n pass (tsc -b)
- bun test packages/i18n → 4 pass / 0 fail (incl. protected division hashes — pre-existing drift on main fixed in commit 477c985)
- bun test packages/sync → 2 pass / 0 fail (unaffected)
- prettier --check on all touched files → pass
- RDD: off (user-owned switch) — no native review; ordinary checks only
- Note: no test infra for native UI components in this repo; verification is typecheck + pattern conformance
- Note: the user's in-flight POS rename was committed as its own work unit (2cdd6d7) so this feature's history stays clean
- Note: dialog scroll uses style maxHeight "80%" on Dialog.Content (no arbitrary Tailwind values in repo) with a single inner ScrollView

## Delivery

- Branch: feat/sales-list-screen (6 commits: 2cdd6d7 rename+fixes, 502277c feature, 477c985 i18n hashes, 4920c80 docs, 9a94217 local sale persist, 13ea808 dialog scroll) — NOT pushed
- Authored changed lines: feature ~330 (within 400 budget)
- Strategy: ask-on-risk
